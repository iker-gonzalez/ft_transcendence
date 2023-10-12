import { Module } from '@nestjs/common';
import { GameSessionsService } from './game-sessions.service';
import { GameSessionsController } from './game-sessions.controller';
import { GameDataController } from './game-data.controller';
import { GameDataService } from './game-data.service';

@Module({
  controllers: [GameSessionsController, GameDataController],
  providers: [GameSessionsService, GameDataService],
})
export class GameModule {}
