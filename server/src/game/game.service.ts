import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NewGameSessionResponseDto } from './dto/new-game-session-response.dto';
import { GameBall } from '@prisma/client';

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  async createNewSession(ball: GameBall): Promise<NewGameSessionResponseDto> {
    const session = await this.prisma.gameSession.create({
      data: {
        ball: {
          create: ball,
        },
      },
      include: {
        ball: true,
      },
    });

    return {
      created: 1,
      data: {
        id: session.id,
        ball: session.ball,
      },
    };
  }
}
