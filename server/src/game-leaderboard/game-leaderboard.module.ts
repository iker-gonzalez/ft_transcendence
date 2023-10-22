import { Module } from '@nestjs/common';
import { GameLeaderboardService } from './game-leaderboard.service';
import { GameLeaderboardController } from './game-leaderboard.controller';
import { GameStatsModule } from 'src/game-stats/game-stats.module';

@Module({
  providers: [GameLeaderboardService],
  controllers: [GameLeaderboardController],
  imports: [GameStatsModule],
})
export class GameLeaderboardModule {}
