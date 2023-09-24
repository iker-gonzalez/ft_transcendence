import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntraService } from '../intra/intra.service';
import { PrismaService } from '../prisma/prisma.service';
import { IntraUserDataDto } from './dto/intra-user-data.dto';
import { User } from '@prisma/client';
import { SigninResponseDto } from './dto/signin-response';
import { JwtService } from '@nestjs/jwt';
import { TwoFactorAuthService } from '../two-factor-auth/two-factor-auth.service';
import { testUser2Data, testUserData } from '../../config/app.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly intraService: IntraService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  async signinUser(
    code: string,
    state: string,
    otp?: string,
  ): Promise<SigninResponseDto> {
    // If state doesn't match, it means that the request is not coming from our app
    if (state !== this.configService.get<string>('INTRA_STATE')) {
      throw new BadRequestException('State value does not match');
    }

    let userData: IntraUserDataDto;
    if (code === this.configService.get<string>('FAKE_USER_1_CODE')) {
      userData = testUserData;
    } else if (code === this.configService.get<string>('FAKE_USER_2_CODE')) {
      userData = testUser2Data;
    } else {
      // Get Intra User Token
      const token: string = await this.intraService.getIntraUserToken(code);
      // Fetch user data from Intra API
      userData = await this.intraService.getIntraUserInfo(token);
    }

    const user: User = await this.prisma.user.findUnique({
      where: { intraId: userData.intraId },
    });

    // If user already exists, return it
    if (user) {
      const {
        avatar,
        email,
        intraId,
        isTwoFactorAuthEnabled,
        username,
      }: IntraUserDataDto = user;

      const id: string = user.id;

      if (user.isTwoFactorAuthEnabled && !this._isTestUser(code)) {
        const isOtpCodeValid =
          this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(
            otp,
            user,
          );

        if (!isOtpCodeValid) {
          throw new UnauthorizedException(
            'Invalid two-factor authentication code',
          );
        }
      }

      const response: SigninResponseDto = {
        created: 0,
        access_token: await this._signToken(id),
        data: {
          avatar,
          email,
          intraId,
          isTwoFactorAuthEnabled,
          username,
        },
      };
      return response;
    }

    // Otherwise, create a new user
    const newUser: User = await this.prisma.user.create({
      data: userData,
    });

    const {
      avatar,
      email,
      intraId,
      isTwoFactorAuthEnabled,
      username,
    }: IntraUserDataDto = newUser;

    const id: string = newUser.id;

    const response: SigninResponseDto = {
      created: 1,
      access_token: await this._signToken(id),
      data: { avatar, email, intraId, isTwoFactorAuthEnabled, username },
    };
    return response;
  }

  _signToken(userId: string): Promise<string> {
    const payload: { sub: string } = {
      sub: userId,
    };

    const jwtExipirationMinutes: string =
      this.configService.get('JWT_EXPIRATION_MINUTES') ?? '20'; // Default value is used in testing
    return this.jwtService.signAsync(payload, {
      expiresIn: `${jwtExipirationMinutes}m`,
      secret: this.configService.get('JWT_SECRET'),
    });
  }

  _isTestUser(code: string): boolean {
    return (
      code === this.configService.get<string>('FAKE_USER_1_CODE') ||
      code === this.configService.get<string>('FAKE_USER_2_CODE')
    );
  }
}
