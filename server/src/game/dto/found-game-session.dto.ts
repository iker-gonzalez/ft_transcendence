import { IsInt, Max, Min } from 'class-validator';
import { GameSessionDto } from './game-session.dto';
import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from 'config/swagger.constants';

export class FoundGameSessionDto {
  @ApiProperty({
    description: swaggerConstants.dto.foundSessionDto.found.description,
    example: swaggerConstants.dto.foundSessionDto.found.example,
  })
  @IsInt()
  @Min(0)
  @Max(1)
  found: number;

  @ApiProperty({
    description: swaggerConstants.dto.foundSessionDto.data.description,
  })
  data: GameSessionDto;
}
