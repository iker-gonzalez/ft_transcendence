import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';
import { StatsDto } from './stats.dto';

export class FetchGameStatsResponseDto {
  @ApiProperty({
    description:
      swaggerConstants.dto.fetchGameStatsResponseDto.found.description,
    example: swaggerConstants.dto.fetchGameStatsResponseDto.found.example,
  })
  @IsNumber()
  found: number;

  @ApiProperty({
    description:
      swaggerConstants.dto.fetchGameStatsResponseDto.data.description,
    example: swaggerConstants.dto.fetchGameStatsResponseDto.data.example,
  })
  data: StatsDto;
}
