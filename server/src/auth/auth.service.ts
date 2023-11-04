import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntraService } from '../intra/intra.service';
import { PrismaService } from '../prisma/prisma.service';
import { IntraUserDataDto } from './dto/intra-user-data.dto';
import { User, UserStatus } from '@prisma/client';
import { SigninResponseDto } from './dto/signin-response';
import { JwtService } from '@nestjs/jwt';
import { TwoFactorAuthService } from '../two-factor-auth/two-factor-auth.service';
import {
  testUser2Data,
  testUser3Data,
  testUserData,
} from '../../config/app.constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as moment from 'moment';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly intraService: IntraService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    } else if (code === this.configService.get<string>('FAKE_USER_3_CODE')) {
      userData = testUser3Data;
    } else {
      // Get Intra User Token
      const token: string = await this.intraService.getIntraUserToken(code);
      // Fetch user data from Intra API
      userData = await this.intraService.getIntraUserInfo(token);
    }

    if (!userData) {
      throw new BadRequestException('Invalid user data');
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

      if (
        user.isTwoFactorAuthEnabled &&
        !this._isTestUser(intraId.toString())
      ) {
        const isOtpCodeValid =
          await this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(
            otp,
            user,
          );

        if (!isOtpCodeValid) {
          throw new UnauthorizedException(
            'Invalid two-factor authentication code',
          );
        }
      }

      // Update user status
      await this.prisma.user.update({
        where: { id },
        data: {
          status: UserStatus.ONLINE,
        },
      });

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
      data: { ...userData, status: UserStatus.ONLINE },
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

  async _signToken(userId: string): Promise<string> {
    const payload: { sub: string } = {
      sub: userId,
    };

    const jwtExipirationMinutes: string =
      this.configService.get('JWT_EXPIRATION_MINUTES') ?? '20'; // Default value is used in testing

    // Set the user as offline when the token expires
    const usersToSetAsOffline: { id: string; timestamp: string }[] =
      (await this.cacheManager.get('offline')) || [];

    const newUsersList = [
      ...usersToSetAsOffline,
      {
        id: userId,
        timestamp: moment().add(+jwtExipirationMinutes, 'm').toDate(),
      },
    ];
    await this.cacheManager.set(
      'offline',
      [...new Set(newUsersList)], // remove duplicates
      0,
    );

    return this.jwtService.signAsync(payload, {
      expiresIn: `${jwtExipirationMinutes}m`,
      secret: this.configService.get('JWT_SECRET'),
    });
  }

  _isTestUser(intraId: string): boolean {
    return (
      intraId === this.configService.get<string>('FAKE_USER_1_ID') ||
      intraId === this.configService.get<string>('FAKE_USER_2_ID') ||
      intraId === this.configService.get<string>('FAKE_USER_3_ID')
    );
  }

  async setUsersAsOffline(): Promise<void> {
    const usersToSetAsOffline: { id: string; timestamp: string }[] =
      (await this.cacheManager.get('offline')) || [];

    const usersThatCanBeSet = usersToSetAsOffline.filter((user) => {
      return moment(user.timestamp).isBefore(moment());
    });

    usersThatCanBeSet.forEach(async (userToBeSetAsOffline) => {
      const updatedUser = await this.prisma.user.update({
        where: { id: userToBeSetAsOffline.id },
        data: {
          status: UserStatus.OFFLINE,
        },
      });

      if (updatedUser) {
        await this.cacheManager.set(
          'offline',
          usersToSetAsOffline.filter(
            (user) => user.id !== userToBeSetAsOffline.id,
          ),
          0,
        );
      }
    });
  }
}
