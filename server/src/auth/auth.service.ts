import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  signinUser(code: string, state: string) {
    if (state !== process.env.INTRA_STATE) {
      throw new BadRequestException('State value does not match');
    }

    // Get Intra User Token

    // Fetch user from database

    // If user already exists, return it

    // Create it

    return 'Hello World!';
  }
}
