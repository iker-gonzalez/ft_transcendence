import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GameStatsService } from './game-stats.service';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { swaggerConstants } from '../../config/swagger.constants';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { User } from '@prisma/client';

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
  //   @ApiCreatedResponse({
  //     description: swaggerConstants.game.data.new.created.description,
  //     type: NewGameDataResponseDto,
  //   })
  //   @ApiUnauthorizedResponse({
  //     description: swaggerConstants.game.data.new.unauthorized.description,
  //   })
  getUserStats(
    @Param('userId') intraId: number,
    @GetUser() user: User,
  ): Promise<any> {
    const userIntraId = intraId ?? user.intraId;
    return this.gameStatsService.getUserStats(userIntraId);
  }
}
