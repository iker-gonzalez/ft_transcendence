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

@Injectable()
export class TwoFactorAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

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

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        twoFactorAuthSecret: secret,
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

  isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    user: User,
  ): boolean {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.twoFactorAuthSecret,
    });
  }

  async activaTwoFactorAuthentication(
    activateOtpDto: ActivateOtpDto,
    user: User,
  ): Promise<ActivateOtpResponseDto> {
    const { otp: twoFactorAuthenticationCode } = activateOtpDto;

    const isCodeValid = this.isTwoFactorAuthenticationCodeValid(
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
