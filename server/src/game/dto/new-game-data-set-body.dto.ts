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
import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';

export class NewGameDataSetBodyPlayerDto {
  @IsInt()
  @IsPositive()
  intraId: number;

  @IsInt()
  @IsPositive()
  score: number;

  @IsString()
  @IsUrl()
  avatar: string;

  @IsString()
  username: string;

  @IsBoolean()
  isWinner: boolean;
}

export class NewGameDataSetBodyDto {
  @ApiProperty({
    description:
      swaggerConstants.dto.NewGameDataSetBodyDto.gameDataId.description,
    example: swaggerConstants.dto.NewGameDataSetBodyDto.gameDataId.example,
  })
  @IsString()
  @IsUUID()
  gameDataId: string;

  @ApiProperty({
    description:
      swaggerConstants.dto.NewGameDataSetBodyDto.startedAt.description,
    example: swaggerConstants.dto.NewGameDataSetBodyDto.startedAt.example,
  })
  @IsDateString()
  startedAt: string;

  @ApiProperty({
    description:
      swaggerConstants.dto.NewGameDataSetBodyDto.elapsedTime.description,
    example: swaggerConstants.dto.NewGameDataSetBodyDto.elapsedTime.example,
  })
  @IsInt()
  @IsPositive()
  elapsedTime: number;

  @ApiProperty({
    description: swaggerConstants.dto.NewGameDataSetBodyDto.player.description,
    example: swaggerConstants.dto.NewGameDataSetBodyDto.player.example,
  })
  @IsObject()
  player: NewGameDataSetBodyPlayerDto;
}
