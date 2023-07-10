import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNameDto } from './dto/update-name.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async updateUsername(
    user: User,
    id: string,
    username: string,
  ): Promise<UpdateNameDto> {
    if (user.id !== id) {
      throw new BadRequestException();
    }

    const userData = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!userData) {
      throw new BadRequestException();
    }

    const newUserData = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        username,
      },
    });

    return {
      updated: 1,
      data: newUserData,
    };
  }
}
