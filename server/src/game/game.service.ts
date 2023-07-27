import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NewGameSessionResponseDto } from './dto/new-game-session-response.dto';
import { GameBall, GamePlayer } from '@prisma/client';
import { FoundGameSessionDto } from './dto/found-game-session.dto';

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  async createNewSession(
    ball: GameBall,
    player1: GamePlayer,
    player2: GamePlayer,
  ): Promise<NewGameSessionResponseDto> {
    const session = await this.prisma.gameSession.create({
      data: {
        ball: {
          create: ball,
        },
        players: {
          createMany: {
            data: [
              { ...player1, index: 0 },
              { ...player2, index: 1 },
            ],
          },
        },
      },
      include: {
        ball: true,
        players: true,
      },
    });

    // Remove unnecessary data
    delete session.ball.gameSessionId;
    delete session.ball.id;
    session.players.forEach((player) => {
      delete player.gameSessionId;
      delete player.id;
    });

    return {
      created: 1,
      data: {
        id: session.id,
        ball: session.ball,
        players: session.players,
      },
    };
  }

  async getSession(sessionId: string): Promise<FoundGameSessionDto> {
    const session = await this.prisma.gameSession.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        ball: true,
        players: true,
      },
    });

    if (!session) throw new NotFoundException('Session not found');

    // Delete unnecessary data
    delete session.createdAt;
    delete session.updatedAt;

    delete session.ball.gameSessionId;
    delete session.ball.id;

    session.players.forEach((player) => {
      delete player.gameSessionId;
      delete player.id;
    });

    return {
      found: 1,
      data: session,
    };
  }
}
