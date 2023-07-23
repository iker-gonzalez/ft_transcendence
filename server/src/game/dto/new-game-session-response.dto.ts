import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Max, Min } from 'class-validator';
import { swaggerConstants } from '../../../config/swagger.constants';

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

export class GameSessionDto {
  @ApiProperty({
    description: swaggerConstants.dto.sessionResponseDto.id.description,
    example: swaggerConstants.dto.sessionResponseDto.id.example,
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: swaggerConstants.dto.sessionResponseDto.players.description,
    example: swaggerConstants.dto.sessionResponseDto.players.example,
  })
  @IsInt()
  @Min(0)
  @Max(2)
  players: number;
}
