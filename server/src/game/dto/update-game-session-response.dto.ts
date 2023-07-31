import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';
import { swaggerConstants } from '../../../config/swagger.constants';
import { GameSessionDto } from './game-session.dto';

export class UpdateGameSessionResponseDto {
  @ApiProperty({
    description:
      swaggerConstants.dto.updatedSessionResponseDto.updated.description,
    example: swaggerConstants.dto.updatedSessionResponseDto.updated.example,
  })
  @IsInt()
  @Min(0)
  @Max(1)
  updated: number;

  @ApiProperty({
    description:
      swaggerConstants.dto.updatedSessionResponseDto.data.description,
  })
  data: GameSessionDto;
}
