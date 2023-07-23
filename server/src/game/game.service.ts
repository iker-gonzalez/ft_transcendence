import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NewGameSessionResponseDto } from './dto/new-game-session-response.dto';

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  async createNewSession(
    numOfPlayers: number,
  ): Promise<NewGameSessionResponseDto> {
    const session = await this.prisma.gameSession.create({
      data: {
        players: {
          createMany: {
            data: Array(numOfPlayers).fill({}),
          },
        },
      },
      include: {
        players: true,
      },
    });

    return {
      created: 1,
      data: {
        id: session.id,
        players: session.players.length,
      },
    };
  }
}
