import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString, IsUrl } from 'class-validator';
import { swaggerConstants } from '../../../config/swagger.constants';

export class IntraUserDataDto {
  @ApiProperty({
    description: swaggerConstants.dto.intraUserSignin.intraId.description,
    example: swaggerConstants.dto.intraUserSignin.intraId.example,
  })
  @IsNumber()
  intraId: number;

  @ApiProperty({
    description: swaggerConstants.dto.intraUserSignin.username.description,
    example: swaggerConstants.dto.intraUserSignin.username.example,
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: swaggerConstants.dto.intraUserSignin.email.description,
    example: swaggerConstants.dto.intraUserSignin.email.example,
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: swaggerConstants.dto.intraUserSignin.avatar.description,
    example: swaggerConstants.dto.intraUserSignin.avatar.example,
  })
  @IsString()
  @IsUrl()
  avatar: string;
}
