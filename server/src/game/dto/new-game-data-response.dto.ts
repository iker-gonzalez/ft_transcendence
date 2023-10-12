import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsObject,
  IsPositive,
  IsString,
  IsUUID,
  IsUrl,
} from 'class-validator';
import { swaggerConstants } from '../../../config/swagger.constants';

export class NewGameDataResponseDataPlayerDto {
  @IsString()
  @IsUUID()
  id: string;

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

  @IsString()
  @IsUUID()
  gameDataSetId: string;
}

export class NewGameDataResponseDataDto {
  @IsString()
  @IsUUID()
  id: string;

  @IsString()
  @IsUUID()
  sessionId: string;

  @IsDateString()
  @IsString()
  startedAt: string;

  @IsInt()
  @IsPositive()
  elapsedTime: number;

  players: NewGameDataResponseDataPlayerDto[];
}

export class NewGameDataResponseDto {
  @ApiProperty({
    description:
      swaggerConstants.dto.newGameDataResponseDto.created.description,
    example: swaggerConstants.dto.newGameDataResponseDto.created.example,
  })
  @IsInt()
  @IsPositive()
  created: number;

  @ApiProperty({
    description: swaggerConstants.dto.newGameDataResponseDto.data.description,
    example: swaggerConstants.dto.newGameDataResponseDto.data.example,
  })
  @IsObject()
  data: NewGameDataResponseDataDto;
}
