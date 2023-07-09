import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntraService } from 'src/intra/intra.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { IntraUserDataDto } from './dto/intra-user-data.dto';
import { User } from '@prisma/client';
import { SigninResponseDto } from './dto/signin-response';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly intraService: IntraService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  signToken(userId: string): Promise<string> {
    const payload = {
      sub: userId,
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: '30m',
      secret: this.configService.get('JWT_SECRET'),
    });
  }

  async signinUser(code: string, state: string): Promise<SigninResponseDto> {
    // Check if state value matches
    // Othwerwise, it means that the request is not coming from our app
    if (state !== this.configService.get<string>('INTRA_STATE')) {
      throw new BadRequestException('State value does not match');
    }

    // Get Intra User Token
    const token: string = await this.intraService.getIntraUserToken(code);

    // Fetch user data from Intra API
    const userData: IntraUserDataDto = await this.intraService.getIntraUserInfo(
      token,
    );

    const user: User = await this.prisma.user.findUnique({
      where: { intraId: userData.intraId },
    });

    // If user already exists, return it
    if (user) {
      const { id, intraId, username, email, avatar } = user;

      const response: SigninResponseDto = {
        created: 0,
        access_token: await this.signToken(id),
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
      access_token: await this.signToken(id),
      data: { intraId, username, email, avatar },
    };
    return response;
  }
}
