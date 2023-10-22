import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GameStatsService } from './game-stats.service';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { swaggerConstants } from '../../config/swagger.constants';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { User } from '@prisma/client';
import { FetchGameStatsResponseDto } from './dto/fetch-game-stats-response.dto';

@ApiTags('Game stats')
@Controller('game/stats')
@UseGuards(JwtGuard)
export class GameStatsController {
  constructor(private readonly gameStatsService: GameStatsService) {}

  @Get(':userId?')
  @ApiParam({
    name: 'userId',
    required: false,
  })
  @ApiOperation({
    summary: swaggerConstants.game.stats.get.summary,
  })
  @ApiCreatedResponse({
    description: swaggerConstants.game.stats.get.ok.description,
    type: FetchGameStatsResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: swaggerConstants.game.stats.get.unauthorized.description,
  })
  @ApiUnprocessableEntityResponse({
    description: swaggerConstants.game.stats.get.unprocessable.description,
  })
  getUserStats(
    @Param('userId') intraId: number,
    @GetUser() user: User,
  ): Promise<FetchGameStatsResponseDto> {
    const userIntraId = intraId ?? +user.intraId;
    return this.gameStatsService.getUserStats(userIntraId);
  }
}
