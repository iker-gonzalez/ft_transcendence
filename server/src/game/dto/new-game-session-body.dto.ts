import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';
import { swaggerConstants } from '../../../config/swagger.constants';
import { Type } from 'class-transformer';

export class NewGameSessionBodyDto {
  @ApiProperty({
    description: swaggerConstants.dto.newSessionDto.players.description,
    example: swaggerConstants.dto.newSessionDto.players.example,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2)
  players: number;
}
