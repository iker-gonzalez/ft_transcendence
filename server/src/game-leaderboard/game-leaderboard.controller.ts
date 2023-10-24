import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GameLeaderboardService } from './game-leaderboard.service';
import { swaggerConstants } from '../../config/swagger.constants';
import { FetchLeaderboardResponseDto } from './dto/fetch-leaderboard-response.dto';

@ApiTags('Game stats')
@Controller('game/leaderboard')
export class GameLeaderboardController {
  constructor(
    private readonly gameLeaderboardService: GameLeaderboardService,
  ) {}

  @Get()
  @ApiOperation({
    summary: swaggerConstants.game.leaderboard.get.summary,
  })
  @ApiOkResponse({
    description: swaggerConstants.game.leaderboard.get.ok.description,
    type: FetchLeaderboardResponseDto,
  })
  getLeaderboard(): Promise<FetchLeaderboardResponseDto> {
    return this.gameLeaderboardService.getLeaderboard();
  }
}
