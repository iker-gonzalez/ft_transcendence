import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { GameSessionsService } from './game-sessions.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { swaggerConstants } from '../../config/swagger.constants';
import { NewGameSessionResponseDto } from './dto/new-game-session-response.dto';
import { GameBall, GamePlayer } from '@prisma/client';
import { NewGameSessionBodyDto } from './dto/new-game-session-body.dto';
import { FoundGameSessionDto } from './dto/found-game-session.dto';
import { UpdateGameSessionResponseDto } from './dto/update-game-session-response.dto';

@ApiTags('Game sessions')
@Controller('game/sessions')
export class GameSessionsController {
  constructor(private readonly gameSessionsService: GameSessionsService) {}

  @Post()
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

    return this.gameSessionsService.createNewSession(ball, player1, player2);
  }

  @Get(':sessionId')
  @ApiOperation({
    summary: swaggerConstants.game.sessions.session.summary,
  })
  @ApiOkResponse({
    description: swaggerConstants.game.sessions.session.ok.description,
    type: FoundGameSessionDto,
  })
  @ApiNotFoundResponse({
    description: swaggerConstants.game.sessions.session.notFound.description,
  })
  @HttpCode(HttpStatus.OK)
  getSession(
    @Param('sessionId') sessionId: string,
  ): Promise<FoundGameSessionDto> {
    return this.gameSessionsService.getSession(sessionId);
  }

  @Put(':sessionId')
  @ApiOperation({
    summary: swaggerConstants.game.sessions.update.summary,
  })
  @ApiOkResponse({
    description: swaggerConstants.game.sessions.update.ok.description,
    type: FoundGameSessionDto,
  })
  @ApiNotFoundResponse({
    description: swaggerConstants.game.sessions.update.notFound.description,
  })
  @ApiBadRequestResponse({
    description: swaggerConstants.game.sessions.update.bad.description,
  })
  putSession(
    @Param('sessionId') sessionId: string,
    @Body() gameSession: NewGameSessionBodyDto,
  ): Promise<UpdateGameSessionResponseDto> {
    return this.gameSessionsService.putSession(sessionId, gameSession);
  }
}
