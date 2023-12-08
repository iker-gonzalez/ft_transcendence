import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';
import { IsInt, IsOptional, IsString, IsStrongPassword } from 'class-validator';

export class RoomOwnerPasswordIntraDTO {
  @ApiProperty({
    description:
      swaggerConstants.dto.roomOwnerPasswordIntradto.data.description,
    example: swaggerConstants.dto.roomOwnerPasswordIntradto.data.example,
  })
  @IsInt()
  ownerIntra: number;

  @IsOptional()
  @IsString()
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;
}
