import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  signinUser(code: string, state: string) {
    if (state !== this.configService.get<string>('INTRA_STATE')) {
      throw new BadRequestException('State value does not match');
    }

    // Get Intra User Token

    // Fetch user from database

    // If user already exists, return it

    // Create it

    return 'Hello World!';
  }
}
