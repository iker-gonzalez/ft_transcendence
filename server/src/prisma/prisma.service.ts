import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(readonly configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get('DATABASE_URL'),
        },
      },
    });
  }

  async cleanDb() {
    await this.user.deleteMany({});
    await this.userGameSession.deleteMany({});
    await this.gameDataSet.deleteMany({});
    await this.gameDataSetPlayer.deleteMany({});
  }
}
