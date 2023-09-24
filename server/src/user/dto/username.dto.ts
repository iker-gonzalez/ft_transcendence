import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { swaggerConstants } from '../../../config/swagger.constants';

export class UsernameDto {
  @ApiProperty({
    description: swaggerConstants.dto.intraUserSignin.username.description,
    example: swaggerConstants.dto.intraUserSignin.username.example,
  })
  @IsString()
  @MinLength(5)
  @MaxLength(12)
  @Matches(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/, {
    message: swaggerConstants.dto.username.regex.message,
  })
  username: string;
}
