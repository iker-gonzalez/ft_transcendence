import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { swaggerConstants } from '../../config/swagger.constants';
import { GameDataService } from './game-data.service';
import { NewGameDataSetBodyDto } from './dto/new-game-data-set-body.dto';
import { NewGameDataResponseDto } from './dto/new-game-data-response.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { FetchUserSessionsResponseDto } from './dto/fetch-user-sessions-response.dto';

@ApiTags('Game data')
@Controller('game/data')
@UseGuards(JwtGuard)
export class GameDataController {
  constructor(private readonly gameDataService: GameDataService) {}

  @Post()
  @ApiOperation({
    summary: swaggerConstants.game.data.new.summary,
  })
  @ApiCreatedResponse({
    description: swaggerConstants.game.data.new.created.description,
    type: NewGameDataResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: swaggerConstants.game.data.new.unauthorized.description,
  })
  createNewSession(
    @Body() newGameDataSetDto: NewGameDataSetBodyDto,
  ): Promise<NewGameDataResponseDto> {
    return this.gameDataService.createNewDataSet(newGameDataSetDto);
  }

  @Get(':userId')
  @ApiParam({
    name: 'userId',
    required: true,
  })
  @ApiOperation({
    summary: swaggerConstants.game.data.fetch.summary,
  })
  @ApiOkResponse({
    description: swaggerConstants.game.data.fetch.ok.description,
    type: FetchUserSessionsResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: swaggerConstants.game.data.fetch.unauthorized.description,
  })
  @ApiUnprocessableEntityResponse({
    description: swaggerConstants.game.data.fetch.unprocessable.description,
  })
  fetchUserSessions(
    @Param('userId') userId: number,
  ): Promise<FetchUserSessionsResponseDto> {
    return this.gameDataService.fetchUserSessions(userId);
  }
}
