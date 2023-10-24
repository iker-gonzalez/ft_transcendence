import { Injectable } from '@nestjs/common';
import { GameStatsService } from '../game-stats/game-stats.service';
import { PrismaService } from '../prisma/prisma.service';
import { FetchLeaderboardResponseDto } from './dto/fetch-leaderboard-response.dto';

@Injectable()
export class GameLeaderboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gameStatsService: GameStatsService,
  ) {}

  async getLeaderboard(): Promise<FetchLeaderboardResponseDto> {
    const allUsers = await this.prisma.user.findMany({});

    const leaderboardData = [];

    for (const user of allUsers) {
      const userStatsRes = await this.gameStatsService.getUserStats(
        user.intraId,
      );

      const userStats = userStatsRes.data;

      leaderboardData.push({
        user: {
          username: user.username,
          intraId: user.intraId,
          avatar: user.avatar,
        },
        stats: {
          rank: userStats.rank,
          wins: userStats.wins,
          losses: userStats.losses,
          totalGames: userStats.totalGames,
          totalGameTime: userStats.totalGameTime,
        },
      });
    }

    const sortedLeaderboardData = leaderboardData.sort((a, b) => {
      return b.stats.rank - a.stats.rank;
    });

    return {
      found: sortedLeaderboardData.length,
      data: sortedLeaderboardData,
    };
  }
}
