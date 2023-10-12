import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { swaggerConstants } from '../../config/swagger.constants';
import { GameDataService } from './game-data.service';
import { NewGameDataSetBodyDto } from './dto/new-game-data-set-body.dto';
import { NewGameDataResponseDto } from './dto/new-game-data-response.dto';

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
  createNewSession(
    @Body() newGameDataSetDto: NewGameDataSetBodyDto,
  ): Promise<any> {
    return this.gameDataService.createNewDataSet(newGameDataSetDto);
  }
}
