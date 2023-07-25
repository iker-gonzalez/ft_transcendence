import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';
import { IsString } from 'class-validator';

export class NewGameSessionBodyDto {
  @ApiProperty({
    description: swaggerConstants.dto.newSessionDto.ball.description,
    example: swaggerConstants.dto.newSessionDto.ball.example,
  })
  @IsString()
  ball: string;

  @ApiProperty({
    description: swaggerConstants.dto.newSessionDto.player1.description,
    example: swaggerConstants.dto.newSessionDto.player1.example,
  })
  @IsString()
  player1: string;

  @ApiProperty({
    description: swaggerConstants.dto.newSessionDto.player2.description,
    example: swaggerConstants.dto.newSessionDto.player2.example,
  })
  @IsString()
  player2: string;
}
