import { IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';
import { Type } from 'class-transformer';

export class GetFriendsParamsDto {
  @ApiProperty({
    description: swaggerConstants.dto.getFriendsParams.friendId.description,
    example: swaggerConstants.dto.getFriendsParams.friendId.example,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @IsInt()
  friendId: number;
}
