import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Server } from 'socket.io';

@Injectable()
export class GameDataService {
  constructor(private readonly prisma: PrismaService) {}

  async onGameStart(server: Server, data: string): Promise<void> {
    const { gameDataId } = JSON.parse(data);

    const gameDataSet = await this.prisma.gameDataSet.findUnique({
      where: { gameDataId: gameDataId.toString() },
    });

    if (!gameDataSet) {
      await this.prisma.gameDataSet.create({
        data: {
          gameDataId: gameDataId.toString(),
          gameData: data,
        },
      });
    }

    server.emit(`gameDataCreated/${gameDataId}`);
  }

  async onPlayerReady(server: Server, data: string): Promise<void> {
    const { isUser1, gameDataId } = JSON.parse(data);

    const gameData = await this.prisma.gameDataSet.findUnique({
      where: { gameDataId: gameDataId.toString() },
    });

    if (!gameData) {
      return;
    }

    await this.prisma.gameDataSet.update({
      where: { gameDataId: gameDataId.toString() },
      data: isUser1 ? { user1Ready: true } : { user2Ready: true },
    });

    if ((isUser1 && gameData.user2Ready) || (!isUser1 && gameData.user1Ready)) {
      server.emit(`allOpponentsReady/${gameDataId}`);
    } else {
      server.emit(`awaitingOpponent/${gameDataId}`);
    }
  }

  async uploadGameData(server: Server, data: string): Promise<void> {
    const { isUser1, gameDataId } = JSON.parse(data);

    let gameData;
    try {
      gameData = await this.prisma.gameDataSet.findUniqueOrThrow({
        where: { gameDataId: gameDataId.toString() },
      });
    } catch (e) {
      return;
    }

    if (gameData.gameData !== data) {
      let updatedGameDataPayload = {
        ...JSON.parse(gameData.gameData),
        ...JSON.parse(data),
      };

      delete updatedGameDataPayload.isUser1;

      await this.prisma.gameDataSet.update({
        where: { gameDataId: gameDataId.toString() },
        data: { gameData: JSON.stringify(updatedGameDataPayload) },
      });

      if (isUser1) {
        server.emit(
          `download/user2/${gameDataId}`,
          JSON.stringify(updatedGameDataPayload),
        );
      } else {
        server.emit(
          `download/user1/${gameDataId}`,
          JSON.stringify(updatedGameDataPayload),
        );
      }
    }
  }

  async deleteGameDataSet(server: Server, data: string): Promise<void> {
    const { gameDataId } = JSON.parse(data);

    try {
      await this.prisma.gameDataSet.delete({
        where: { gameDataId: gameDataId.toString() },
      });
    } catch (e) {
      server.emit(`gameSetDeleted/${gameDataId}`);
      return;
    }

    server.emit(`gameSetDeleted/${gameDataId}`);
  }
}
