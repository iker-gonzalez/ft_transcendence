import { Inject, Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { GameDataSetDto } from './dto/game-data-set.dto';
import { GameDataDto } from './dto/game-data.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class GameDataService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async onGameStart(server: Server, data: string): Promise<void> {
    const { gameDataId } = JSON.parse(data);

    const gameDataSets: GameDataSetDto[] =
      (await this.cacheManager.get('gameDataSets')) || [];
    const gameDataSet: GameDataSetDto = gameDataSets.find(
      (gameDataSet: GameDataSetDto) =>
        gameDataSet.gameDataId === gameDataId.toString(),
    );

    if (!gameDataSet) {
      await this.cacheManager.set('gameDataSets', [
        ...gameDataSets,
        {
          gameDataId: gameDataId.toString(),
          gameData: data,
          user1Ready: false,
          user2Ready: false,
        },
      ]);
    }

    server.emit(`gameDataCreated/${gameDataId}`);
  }

  async onPlayerReady(server: Server, data: string): Promise<void> {
    const { isUser1, gameDataId } = JSON.parse(data);

    const gameDataSets: GameDataSetDto[] =
      (await this.cacheManager.get('gameDataSets')) || [];
    const gameDataIndex: number = gameDataSets.findIndex(
      (gameDataSet) => gameDataSet.gameDataId === gameDataId.toString(),
    );

    if (gameDataIndex === -1) {
      return;
    }

    if (isUser1) {
      gameDataSets[gameDataIndex] = {
        ...gameDataSets[gameDataIndex],
        user1Ready: true,
      };
    } else {
      gameDataSets[gameDataIndex] = {
        ...gameDataSets[gameDataIndex],
        user2Ready: true,
      };
    }

    await this.cacheManager.set('gameDataSets', gameDataSets);

    if (
      gameDataSets[gameDataIndex].user1Ready &&
      gameDataSets[gameDataIndex].user2Ready
    ) {
      server.emit(`allOpponentsReady/${gameDataId}`);
    } else {
      server.emit(`awaitingOpponent/${gameDataId}`);
    }
  }

  async uploadGameData(server: Server, data: string): Promise<void> {
    const { isUser1, gameDataId }: { isUser1: boolean; gameDataId: number } =
      JSON.parse(data);

    const gameDataSets: GameDataSetDto[] =
      (await this.cacheManager.get('gameDataSets')) || [];
    const gameDataIndex: number = gameDataSets.findIndex(
      (gameDataSet) =>
        gameDataSet.gameDataId.toString() === gameDataId.toString(),
    );

    if (gameDataIndex === -1) {
      return;
    }

    if (gameDataSets[gameDataIndex].gameData !== data) {
      const updatedGameDataPayload: GameDataDto = {
        ...JSON.parse(gameDataSets[gameDataIndex].gameData),
        ...JSON.parse(data),
      };

      gameDataSets[gameDataIndex].gameData = JSON.stringify(
        updatedGameDataPayload,
      );

      await this.cacheManager.set('gameDataSets', gameDataSets);

      // Emitting these events is not necessary, but it eases testing
      if (isUser1) {
        server.emit(`uploaded/user1/${gameDataId}`);
      } else {
        server.emit(`uploaded/user2/${gameDataId}`);
      }
    }
  }

  async downloadGameData(server: Server, data: string): Promise<void> {
    const { isUser1, gameDataId }: { isUser1: boolean; gameDataId: number } =
      JSON.parse(data);

    const gameDataSets: GameDataSetDto[] =
      (await this.cacheManager.get('gameDataSets')) || [];
    const gameDataSet: GameDataSetDto = gameDataSets.find(
      (gameDataSet) => gameDataSet.gameDataId === gameDataId.toString(),
    );

    if (!gameDataSet) {
      return;
    }

    const gameData: GameDataDto = JSON.parse(gameDataSet.gameData);

    if (isUser1) {
      server.emit(
        `downloaded/user1/${gameDataId}`,
        JSON.stringify({ user2: gameData.user2 }),
      );
    } else {
      server.emit(
        `downloaded/user2/${gameDataId}`,
        JSON.stringify({ user1: gameData.user1, ball: gameData.ball }),
      );
    }
  }

  async deleteGameDataSet(server: Server, data: string): Promise<void> {
    const { gameDataId } = JSON.parse(data);

    const gameDataSets: GameDataSetDto[] =
      (await this.cacheManager.get('gameDataSets')) || [];
    // Emit different event if gameDataId is not found
    const filteredGameDataSets: GameDataSetDto[] = gameDataSets.filter(
      (gameDataSet: GameDataSetDto) =>
        gameDataSet.gameDataId !== gameDataId.toString(),
    );

    if (filteredGameDataSets.length === gameDataSets.length) {
      server.emit(`gameSetNotFound/${gameDataId}`);
      return;
    }

    await this.cacheManager.set('gameDataSets', filteredGameDataSets);

    server.emit(`gameSetDeleted/${gameDataId}`);
  }
}
