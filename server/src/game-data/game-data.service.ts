import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { GameDataSetDto } from './dto/game-data-set.dto';
import { GameDataDto } from './dto/game-data.dto';

@Injectable()
export class GameDataService {
  gameDataSets: GameDataSetDto[] = [];

  onGameStart(server: Server, data: string): void {
    const { gameDataId } = JSON.parse(data);

    const gameDataSet: GameDataSetDto = this.gameDataSets.find(
      (gameDataSet: GameDataSetDto) =>
        gameDataSet.gameDataId === gameDataId.toString(), // TODO remove conversion to string, probably not necessary
    );

    if (!gameDataSet) {
      this.gameDataSets.push({
        gameDataId: gameDataId.toString(),
        gameData: data,
        user1Ready: false,
        user2Ready: false,
      });
    }

    server.emit(`gameDataCreated/${gameDataId}`);
  }

  onPlayerReady(server: Server, data: string): void {
    const { isUser1, gameDataId } = JSON.parse(data);

    const gameDataIndex: number = this.gameDataSets.findIndex(
      (gameDataSet) => gameDataSet.gameDataId === gameDataId.toString(),
    );

    if (gameDataIndex === -1) {
      return;
    }

    if (isUser1) {
      this.gameDataSets[gameDataIndex] = {
        ...this.gameDataSets[gameDataIndex],
        user1Ready: true,
      };
    } else {
      this.gameDataSets[gameDataIndex] = {
        ...this.gameDataSets[gameDataIndex],
        user2Ready: true,
      };
    }

    if (
      this.gameDataSets[gameDataIndex].user1Ready &&
      this.gameDataSets[gameDataIndex].user2Ready
    ) {
      server.emit(`allOpponentsReady/${gameDataId}`);
    } else {
      server.emit(`awaitingOpponent/${gameDataId}`);
    }
  }

  uploadGameData(server: Server, data: string): void {
    const { isUser1, gameDataId }: { isUser1: boolean; gameDataId: number } =
      JSON.parse(data);

    const gameDataIndex: number = this.gameDataSets.findIndex(
      (gameDataSet) =>
        gameDataSet.gameDataId.toString() === gameDataId.toString(),
    );

    if (gameDataIndex === -1) {
      return;
    }

    if (this.gameDataSets[gameDataIndex].gameData !== data) {
      const updatedGameDataPayload: GameDataDto = {
        ...JSON.parse(this.gameDataSets[gameDataIndex].gameData),
        ...JSON.parse(data),
      };

      this.gameDataSets[gameDataIndex].gameData = JSON.stringify(
        updatedGameDataPayload,
      );

      // Emitting these events is not necessary, but it eases testing
      if (isUser1) {
        server.emit(`uploaded/user1/${gameDataId}`);
      } else {
        server.emit(`uploaded/user2/${gameDataId}`);
      }
    }
  }

  downloadGameData(server: Server, data: string): void {
    const { isUser1, gameDataId }: { isUser1: boolean; gameDataId: number } =
      JSON.parse(data);

    const gameDataSet: GameDataSetDto = this.gameDataSets.find(
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
        JSON.stringify({
          ball: gameData.ball,
          user1: gameData.user1,
          user2: gameData.user2, // user2 relies on this for updated score
        }),
      );
    }
  }

  onGameEnd(server: Server, data: string): void {
    const { player, gameDataId } = JSON.parse(data);

    server.emit(`gameEnded/${player.intraId}/${gameDataId}`, data);
  }

  deleteGameDataSet(server: Server, data: string): void {
    const { gameDataId } = JSON.parse(data);

    // Emit different event if gameDataId is not found
    const filteredGameDataSets: GameDataSetDto[] = this.gameDataSets.filter(
      (gameDataSet: GameDataSetDto) =>
        gameDataSet.gameDataId !== gameDataId.toString(),
    );

    if (filteredGameDataSets.length === this.gameDataSets.length) {
      server.emit(`gameSetNotFound/${gameDataId}`);
      return;
    }

    this.gameDataSets = filteredGameDataSets;

    server.emit(`gameSetDeleted/${gameDataId}`);
  }

  abortGame(server: Server, data: string): string {
    const {
      isUser1,
      isSoloMode,
      gameDataId,
    }: { isUser1: boolean; isSoloMode: boolean; gameDataId: string } =
      JSON.parse(data);

    if (isSoloMode) {
      server.emit(`gameAborted/user2/${gameDataId}`);
      return 'OK';
    }

    if (isUser1 === undefined || gameDataId === undefined) {
      return 'KO';
    }

    const gameDataSet: GameDataSetDto = this.gameDataSets.find(
      (gameDataSet) => gameDataSet.gameDataId === gameDataId.toString(),
    );

    if (!gameDataSet) {
      return 'KO';
    }

    // Delete gameDataSet from cache
    this.gameDataSets = this.gameDataSets.filter(
      (gameDataSet: GameDataSetDto) =>
        gameDataSet.gameDataId !== gameDataId.toString(),
    );

    if (isUser1) {
      server.emit(`gameAborted/user1/${gameDataId}`);
    } else {
      server.emit(`gameAborted/user2/${gameDataId}`);
    }

    return 'OK';
  }
}
