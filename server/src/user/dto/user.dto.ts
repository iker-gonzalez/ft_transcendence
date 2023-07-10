import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { swaggerConstants } from '../../../config/swagger.constants';

export class UserDto implements User {
  @ApiProperty({
    description: swaggerConstants.dto.userDto.id.description,
    example: swaggerConstants.dto.userDto.id.example,
  })
  id: string;

  @ApiProperty({
    description: swaggerConstants.dto.userDto.createdAt.description,
    example: swaggerConstants.dto.userDto.createdAt.example,
  })
  createdAt: Date;

  @ApiProperty({
    description: swaggerConstants.dto.userDto.updatedAt.description,
    example: swaggerConstants.dto.userDto.updatedAt.example,
  })
  updatedAt: Date;

  @ApiProperty({
    description: swaggerConstants.dto.intraUserSignin.intraId.description,
    example: swaggerConstants.dto.intraUserSignin.intraId.example,
  })
  intraId: number;

  @ApiProperty({
    description: swaggerConstants.dto.intraUserSignin.username.description,
    example: swaggerConstants.dto.intraUserSignin.username.example,
  })
  username: string;

  @ApiProperty({
    description: swaggerConstants.dto.intraUserSignin.avatar.description,
    example: swaggerConstants.dto.intraUserSignin.avatar.example,
  })
  avatar: string;

  @ApiProperty({
    description: swaggerConstants.dto.intraUserSignin.email.description,
    example: swaggerConstants.dto.intraUserSignin.email.example,
  })
  email: string;
}
