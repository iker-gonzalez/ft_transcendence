import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';
import { swaggerConstants } from '../../../config/swagger.constants';
import { GameSessionDto } from './game-session.dto';
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
