import {
  IsDefined,
  IsInt,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';
import { Type } from 'class-transformer';

export class FriendsParamsDto {
  @ApiProperty({
    description: swaggerConstants.dto.friendsParams.friendId.description,
    example: swaggerConstants.dto.friendsParams.friendId.example,
  })
  @Type(() => Number)
  @IsNumber()
  @IsDefined()
  @IsPositive()
  @IsInt()
  friendId: number;
}
