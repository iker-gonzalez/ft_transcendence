import { Module } from '@nestjs/common';
import { GameStatsController } from './game-stats.controller';
import { GameStatsService } from './game-stats.service';

@Module({
  controllers: [GameStatsController],
  providers: [GameStatsService],
})
export class GameStatsModule {}
