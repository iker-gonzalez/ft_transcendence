import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { swaggerConstants } from '../../../config/swagger.constants';

export class UsernameDto {
  @ApiProperty({
    description: swaggerConstants.dto.intraUserSignin.username.description,
    example: swaggerConstants.dto.intraUserSignin.username.example,
  })
  @IsString()
  @MinLength(5)
  @MaxLength(12)
  username: string;
}
