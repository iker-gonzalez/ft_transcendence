import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NewGameSessionResponseDto } from './dto/new-game-session-response.dto';
import { GameBall, GamePlayer, GameSession } from '@prisma/client';
import { FoundGameSessionDto } from './dto/found-game-session.dto';
import { NewGameSessionBodyDto } from './dto/new-game-session-body.dto';
import { UpdateGameSessionResponseDto } from './dto/update-game-session-response.dto';

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

  async putSession(
    sessionId: string,
    gameSession: NewGameSessionBodyDto,
  ): Promise<UpdateGameSessionResponseDto> {
    let ball: GameBall;
    let player1: GamePlayer;
    let player2: GamePlayer;

    try {
      ball = JSON.parse(gameSession.ball);
      player1 = JSON.parse(gameSession.player1);
      player2 = JSON.parse(gameSession.player2);
    } catch (e) {
      throw new BadRequestException('Invalid data');
    }

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

    await this.prisma.gameBall.update({
      where: {
        id: session.ball.id,
      },
      data: ball,
    });

    await this.prisma.gamePlayer.update({
      where: {
        id: session.players[0].id,
      },
      data: player1,
    });

    await this.prisma.gamePlayer.update({
      where: {
        id: session.players[1].id,
      },
      data: player2,
    });

    return {
      updated: 1,
      data: session,
    };
  }
}
