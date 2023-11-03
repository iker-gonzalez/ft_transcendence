import { BadRequestException, Injectable } from '@nestjs/common';
import { User, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PatchStatusResDto } from './dto/patch-status-res.dto';

@Injectable()
export class StatusService {
  constructor(private readonly prisma: PrismaService) {}

  async patchUserStatus(
    intraId: number,
    status: UserStatus,
  ): Promise<PatchStatusResDto> {
    let dbUser: User;
    try {
      dbUser = await this.prisma.user.findUniqueOrThrow({
        where: { intraId },
      });
    } catch (e) {
      throw new BadRequestException('User not found');
    }

    await this.prisma.user.update({
      where: { intraId },
      data: { status },
    });

    return {
      updated: dbUser.status === status ? 0 : 1,
      data: {
        intraId,
        status,
      },
    };
  }

  async getUserStatus(intraId: number): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { intraId },
      select: { status: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      found: 1,
      data: {
        intraId,
        status: user.status,
      },
    };
  }
}
