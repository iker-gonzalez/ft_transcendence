import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { swaggerConstants } from '../../config/swagger.constants';
import { GameDataService } from './game-data.service';
import { NewGameDataSetBodyDto } from './dto/new-game-data-set-body.dto';
import { NewGameDataResponseDto } from './dto/new-game-data-response.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';

@ApiTags('Game data')
@Controller('game/data')
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
  @UseGuards(JwtGuard)
  createNewSession(
    @Body() newGameDataSetDto: NewGameDataSetBodyDto,
  ): Promise<any> {
    return this.gameDataService.createNewDataSet(newGameDataSetDto);
  }
}
