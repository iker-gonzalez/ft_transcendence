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
import { createCipheriv } from 'crypto';
import { createDecipheriv } from 'crypto';

@Injectable()
export class TwoFactorAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  key = 'a9a2c446fc3a2e2627202dcedf1ef358';
  iv = '9491960c7bd9e96e';

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
        twoFactorAuthSecret: encryptedText,
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
      decipher.update(Buffer.from(user.twoFactorAuthSecret)),
      decipher.final(),
    ]);

    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: decryptedText.toString(),
    });
  }

  async activateTwoFactorAuthentication(
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

  async deactivateTwoFactorAuthentication(
    deactivateOtpDto: ActivateOtpDto,
    user: User,
  ): Promise<ActivateOtpResponseDto> {
    const { otp: twoFactorAuthenticationCode } = deactivateOtpDto;

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
        isTwoFactorAuthEnabled: false,
        twoFactorAuthSecret: null,
      },
    });

    return {
      updated: 1,
    };
  }
}
