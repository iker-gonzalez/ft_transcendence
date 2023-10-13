import { Module } from '@nestjs/common';
import { GameDataController } from './game-data.controller';
import { GameDataService } from './game-data.service';

@Module({
  controllers: [GameDataController],
  providers: [GameDataService],
})
export class GameModule {}
