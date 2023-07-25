import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Max, Min } from 'class-validator';
import { swaggerConstants } from '../../../config/swagger.constants';
import { GameBall } from '@prisma/client';

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
}

export class NewGameSessionResponseDto {
  @ApiProperty({
    description: swaggerConstants.dto.newSessionResponseDto.created.description,
    example: swaggerConstants.dto.newSessionResponseDto.created.example,
  })
  @IsInt()
  @Min(0)
  @Max(1)
  created: number;

  @ApiProperty({
    description: swaggerConstants.dto.newSessionResponseDto.data.description,
  })
  data: GameSessionDto;
}
