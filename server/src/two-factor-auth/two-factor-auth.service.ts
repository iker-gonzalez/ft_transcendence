import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { authenticator } from 'otplib';
import { PrismaService } from '../prisma/prisma.service';
import { toFileStream } from 'qrcode';
import { OtpAuthUrlDto } from './dto/otp-auth-url.dto';
import { ActivateOtpResponseDto } from './dto/activate-otp-response.dto';
import { ActivateOtpDto } from './dto/activate-otp.dto';
import { createCipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { createDecipheriv } from 'crypto';

@Injectable()
export class TwoFactorAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  key: Buffer;
  iv = randomBytes(16);

  _isTestUser(intraId: string): boolean {
    return (
      intraId === this.configService.get<string>('FAKE_USER_1_ID') ||
      intraId === this.configService.get<string>('FAKE_USER_2_ID') ||
      intraId === this.configService.get<string>('FAKE_USER_3_ID')
    );
  }

  async generateTwoFactorAuthenticationSecret(
    user: User,
  ): Promise<OtpAuthUrlDto> {
    const secret = authenticator.generateSecret();

    const otpauthUrl = authenticator.keyuri(
      user.email,
      this.configService.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'),
      secret,
    );

    if (this._isTestUser(user.intraId.toString())) {
      throw new UnprocessableEntityException(
        "You can't activate 2FA on test users",
      );
    }

    // The key length is dependent on the algorithm.
    // In this case for aes256, it is 32 bytes.
    this.key = (await promisify(scrypt)(
      this.configService.get<string>('CIPHER_SECRET'),
      'salt',
      32,
    )) as Buffer;
    const cipher = createCipheriv('aes-256-ctr', this.key, this.iv);

    const encryptedText = Buffer.concat([
      cipher.update(secret),
      cipher.final(),
    ]);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        twoFactorAuthSecret: encryptedText.toString('hex'),
      },
    });

    return {
      otpauthUrl,
    };
  }

  pipeQrCodeStream(
    stream: Response,
    otpauthUrlDto: OtpAuthUrlDto,
  ): Promise<any> {
    const { otpauthUrl } = otpauthUrlDto;
    return toFileStream(stream, otpauthUrl);
  }

  async isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    user: User,
  ): Promise<boolean> {
    const decipher = createDecipheriv('aes-256-ctr', this.key, this.iv);
    const decryptedText = Buffer.concat([
      decipher.update(Buffer.from(user.twoFactorAuthSecret, 'hex')),
      decipher.final(),
    ]);

    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: decryptedText.toString(),
    });
  }

  async activaTwoFactorAuthentication(
    activateOtpDto: ActivateOtpDto,
    user: User,
  ): Promise<ActivateOtpResponseDto> {
    const { otp: twoFactorAuthenticationCode } = activateOtpDto;

    const isCodeValid = await this.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode,
      user,
    );

    if (!isCodeValid) {
      throw new BadRequestException('Invalid two factor authentication code');
    }

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isTwoFactorAuthEnabled: true,
      },
    });

    return {
      updated: 1,
    };
  }
}
