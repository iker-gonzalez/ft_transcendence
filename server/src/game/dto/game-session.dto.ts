import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';
import { IsUUID } from 'class-validator';
import { GameBall, GamePlayer } from '@prisma/client';

export class GameSessionDto {
  @ApiProperty({
    description: swaggerConstants.dto.sessionResponseDto.id.description,
    example: swaggerConstants.dto.sessionResponseDto.id.example,
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: swaggerConstants.dto.sessionResponseDto.ball.description,
    example: swaggerConstants.dto.sessionResponseDto.ball.example,
  })
  ball: GameBall;

  @ApiProperty({
    description: swaggerConstants.dto.sessionResponseDto.players.description,
    example: swaggerConstants.dto.sessionResponseDto.players.example,
  })
  players: GamePlayer[];
}
