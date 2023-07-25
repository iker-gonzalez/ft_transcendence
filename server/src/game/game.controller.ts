import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { GameService } from './game.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { swaggerConstants } from '../../config/swagger.constants';
import { NewGameSessionResponseDto } from './dto/new-game-session-response.dto';
import { GameBall, GamePlayer } from '@prisma/client';
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
    let ball: GameBall;
    let player1: GamePlayer;
    let player2: GamePlayer;

    try {
      ball = JSON.parse(newGameSessionDto.ball);
      player1 = JSON.parse(newGameSessionDto.player1);
      player2 = JSON.parse(newGameSessionDto.player2);
    } catch (e) {
      throw new BadRequestException('Invalid data');
    }

    return this.gameService.createNewSession(ball, player1, player2);
  }
}
