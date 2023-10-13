import {
  IsBoolean,
  IsDateString,
  IsDefined,
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
  @IsDefined()
  intraId: number;

  @IsInt()
  @IsPositive()
  @IsDefined()
  score: number;

  @IsString()
  @IsUrl()
  @IsDefined()
  avatar: string;

  @IsString()
  @IsDefined()
  username: string;

  @IsBoolean()
  @IsDefined()
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
  @IsDefined()
  gameDataId: string;

  @ApiProperty({
    description:
      swaggerConstants.dto.NewGameDataSetBodyDto.startedAt.description,
    example: swaggerConstants.dto.NewGameDataSetBodyDto.startedAt.example,
  })
  @IsDateString()
  @IsDefined()
  startedAt: string;

  @ApiProperty({
    description:
      swaggerConstants.dto.NewGameDataSetBodyDto.elapsedTime.description,
    example: swaggerConstants.dto.NewGameDataSetBodyDto.elapsedTime.example,
  })
  @IsInt()
  @IsPositive()
  @IsDefined()
  elapsedTime: number;

  @ApiProperty({
    description: swaggerConstants.dto.NewGameDataSetBodyDto.player.description,
    example: swaggerConstants.dto.NewGameDataSetBodyDto.player.example,
  })
  @IsObject()
  @IsDefined()
  player: NewGameDataSetBodyPlayerDto;
}
