import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsInt,
  IsPositive,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { swaggerConstants } from '../../../config/swagger.constants';

export class FetchUserSessionsResponsePlayerDto {
  @IsInt()
  @IsPositive()
  intraId: number;

  @IsInt()
  @IsPositive()
  score: number;

  @IsBoolean()
  isWinner: boolean;

  @IsString()
  @IsUrl()
  avatar: string;

  @IsString()
  username: string;
}

export class FetchUserSessionsResponseDto {
  @ApiProperty({
    description:
      swaggerConstants.dto.fetchUserSessionsResponseDto.found.description,
    example: swaggerConstants.dto.fetchUserSessionsResponseDto.found.example,
  })
  @IsInt()
  @Min(0)
  @Max(1)
  found: number;

  @ApiProperty({
    description:
      swaggerConstants.dto.fetchUserSessionsResponseDto.data.description,
    example: swaggerConstants.dto.fetchUserSessionsResponseDto.data.example,
  })
  @IsArray()
  @IsDefined()
  data: any[];
}
