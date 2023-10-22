import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GameLeaderboardService } from './game-leaderboard.service';

@ApiTags('Game stats')
@Controller('game/leaderboard')
export class GameLeaderboardController {
  constructor(
    private readonly gameLeaderboardService: GameLeaderboardService,
  ) {}

  @Get()
  getLeaderboard(): Promise<any> {
    return this.gameLeaderboardService.getLeaderboard();
  }
}
