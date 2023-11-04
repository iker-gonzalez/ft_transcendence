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

  iv = randomBytes(16);
  salt = randomBytes(16).toString('hex');

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

    const key = (await promisify(scrypt)(
      this.configService.get<string>('CIPHER_SECRET'),
      this.salt,
      32, // for aes256, it is 32 bytes.
    )) as Buffer;
    const cipher = createCipheriv('aes-256-ctr', key, this.iv);

    const encryptedSecret = Buffer.concat([
      cipher.update(secret),
      cipher.final(),
    ]).toString('hex');

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        twoFactorAuthSecret: encryptedSecret,
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
    // The key length is dependent on the algorithm.
    // In this case for aes256, it is 32 bytes.
    const key = (await promisify(scrypt)(
      this.configService.get<string>('CIPHER_SECRET'),
      this.salt,
      32,
    )) as Buffer;

    const decipher = createDecipheriv('aes-256-ctr', key, this.iv);
    const decryptedSecret = Buffer.concat([
      decipher.update(Buffer.from(user.twoFactorAuthSecret, 'hex')),
      decipher.final(),
    ]).toString('utf8');

    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: decryptedSecret,
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
