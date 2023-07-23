import { Body, Controller, Post } from '@nestjs/common';
import { GameService } from './game.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { swaggerConstants } from '../../config/swagger.constants';
import { NewGameSessionResponseDto } from './dto/new-game-session-response.dto';
import { NewGameSessionBodyDto } from './dto/new-game-session-body.dto';

@ApiTags('Game')
@Controller('game/sessions')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('new')
  @ApiOperation({
    summary: swaggerConstants.game.sessions.new.summary,
  })
  @ApiCreatedResponse({
    description: swaggerConstants.game.sessions.new.created.description,
    type: NewGameSessionResponseDto,
  })
  @ApiBadRequestResponse({
    description: swaggerConstants.game.sessions.new.bad.description,
  })
  createNewSession(
    @Body() newGameSessionDto: NewGameSessionBodyDto,
  ): Promise<NewGameSessionResponseDto> {
    return this.gameService.createNewSession(newGameSessionDto.players);
  }
}
