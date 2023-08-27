import { Module } from '@nestjs/common';
import { GameDataGateway } from './game-data.gateway';
import { GameDataService } from './game-data.service';

@Module({
  providers: [GameDataGateway, GameDataService],
})
export class GameDataModule {}
