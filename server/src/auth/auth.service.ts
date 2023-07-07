import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntraService } from 'src/intra/intra.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly intraService: IntraService,
  ) {}

  async signinUser(code: string, state: string) {
    // Check if state value matches
    // Othwerwise, it means that the request is not coming from our app
    if (state !== this.configService.get<string>('INTRA_STATE')) {
      throw new BadRequestException('State value does not match');
    }

    // Get Intra User Token
    const token: string = await this.intraService.getIntraUserToken(code);

    // Fetch user from database

    // If user already exists, return it

    // Create it

    return token;
  }
}
