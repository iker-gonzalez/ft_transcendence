import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GameStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserStats(intraId: number) {
    const userGameDataSets = await this.prisma.gameDataSet.findMany({
      where: {
        players: {
          some: {
            intraId: +intraId,
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
      include: {
        players: true,
      },
    });

    const filteredUserGameDataSets = userGameDataSets.filter((gameDataSet) => {
      // If session doesn't have 2 players, it's not a valid session
      return gameDataSet.players.length === 2;
    });

    const playerDataSets = filteredUserGameDataSets.map((gameDataSet) => {
      return gameDataSet.players.find((player) => player.intraId === +intraId);
    });

    const wins: number = playerDataSets.reduce((acc, playerData) => {
      return playerData.isWinner ? acc + 1 : acc;
    }, 0);

    const losses: number = playerDataSets.reduce((acc, playerData) => {
      return !playerData.isWinner ? acc + 1 : acc;
    }, 0);

    const longestMatch: number = filteredUserGameDataSets.reduce(
      (acc, gameDataSet) => {
        return gameDataSet.elapsedTime > acc ? gameDataSet.elapsedTime : acc;
      },
      0,
    );

    const quickestWin: number = filteredUserGameDataSets.reduce(
      (acc, gameDataSet) => {
        const playerData = gameDataSet.players.find(
          (player) => player.intraId === +intraId,
        );

        if (playerData.isWinner)
          return gameDataSet.elapsedTime > acc ? gameDataSet.elapsedTime : acc;

        return acc;
      },
      0,
    );

    const busiestDayList = filteredUserGameDataSets.reduce(
      (acc, gameDataSet) => {
        const dateIndex = acc.findIndex((accObject) => {
          return accObject.date === gameDataSet.startedAt.toDateString();
        });

        if (dateIndex === -1) {
          acc.push({
            date: gameDataSet.startedAt.toDateString(),
            count: 1,
          });
        } else {
          acc[dateIndex].count += 1;
        }

        return acc;
      },
      [{ date: '', count: 0 }],
    );

    const busiestDay = busiestDayList.reduce(
      (acc, accObject) => {
        return accObject.count > acc.count ? accObject : acc;
      },
      { date: '', count: 0 },
    );

    const opponentDataSets = filteredUserGameDataSets.map((gameDataSet) => {
      return gameDataSet.players.find((player) => player.intraId !== +intraId);
    });

    const nemesisList = opponentDataSets.reduce((acc, opponentData) => {
      if (opponentData.isWinner) {
        const opponentAccIndex = acc.findIndex(
          (nemesis) => nemesis.intraId === opponentData.intraId,
        );

        if (opponentAccIndex !== -1) {
          acc[opponentAccIndex].count += 1;
        } else {
          acc.push({
            avatar: opponentData.avatar,
            intraId: opponentData.intraId,
            username: opponentData.username,
            count: 1,
          });
        }
      }

      return acc;
    }, []);

    const nemesis = nemesisList.reduce(
      (acc, nemesis) => {
        return nemesis.count > acc.count ? nemesis : acc;
      },
      { count: 0 },
    );

    const victimList = opponentDataSets.reduce((acc, opponentData) => {
      if (!opponentData.isWinner) {
        const opponentAccIndex = acc.findIndex(
          (victim) => victim.intraId === opponentData.intraId,
        );

        if (opponentAccIndex !== -1) {
          acc[opponentAccIndex].count += 1;
        } else {
          acc.push({
            avatar: opponentData.avatar,
            intraId: opponentData.intraId,
            username: opponentData.username,
            count: 1,
          });
        }
      }

      return acc;
    }, []);

    const victim = victimList.reduce(
      (acc, victim) => {
        return victim.count > acc.count ? victim : acc;
      },
      { count: 0 },
    );

    const longestWinStreakData = playerDataSets.reduce(
      (acc, playerData) => {
        if (playerData.isWinner) {
          acc.currentCount++;
        } else {
          if (acc.currentCount > acc.streak) acc.streak = acc.currentCount;

          acc.currentCount = 0;
        }

        return acc;
      },
      { streak: 0, currentCount: 0 },
    );
    const { streak, currentCount } = longestWinStreakData;
    const longestWinStreak = streak > currentCount ? streak : currentCount;

    const currentWinStreak = playerDataSets
      .reverse()
      .findIndex((playerData) => {
        return !playerData.isWinner;
      });

    return {
      found: filteredUserGameDataSets.length,
      data: {
        rank: Math.round(wins / 5),
        totalGames: filteredUserGameDataSets.length,
        wins,
        losses,
        longestWinStreak,
        currentWinStreak,
        longestMatch,
        quickestWin,
        nemesis,
        victim,
        busiestDay,
      },
    };
  }
}
