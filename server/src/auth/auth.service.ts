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
import { jwtConfig } from '../../config/jwt.config';
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
    // Check if state value matches
    // Othwerwise, it means that the request is not coming from our app
    if (state !== this.configService.get<string>('INTRA_STATE')) {
      throw new BadRequestException('State value does not match');
    }

    let userData: IntraUserDataDto;
    console.log('code before: ', code);
    if (code === this.configService.get<string>('FAKE_USER_1_CODE')) {
      userData = testUserData;
    } else if (code === this.configService.get<string>('FAKE_USER_2_CODE')) {
      userData = testUser2Data;
    } else {
      // Get Intra User Token
      const token: string = await this.intraService.getIntraUserToken(code);
      console.log('token: ', token);
      // Fetch user data from Intra API
      userData = await this.intraService.getIntraUserInfo(token);
      console.log(userData);
    }

    const user: User = await this.prisma.user.findUnique({
      where: { intraId: userData.intraId },
    });

    // If user already exists, return it
    if (user) {
      const { id, intraId, username, email, avatar } = user;

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
          intraId,
          username,
          email,
          avatar,
        },
      };
      return response;
    }

    // Otherwise, create a new user
    const newUser: User = await this.prisma.user.create({
      data: userData,
    });

    const { id, intraId, username, email, avatar } = newUser;
    const response: SigninResponseDto = {
      created: 1,
      access_token: await this._signToken(id),
      data: { intraId, username, email, avatar },
    };
    return response;
  }

  _signToken(userId: string): Promise<string> {
    const payload = {
      sub: userId,
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: jwtConfig.expiration,
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
