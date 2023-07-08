import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString, IsUrl } from 'class-validator';

export class IntraUserDataDto {
  @ApiProperty({
    description: 'User ID from 42 Intra API',
    example: 12345,
  })
  @IsNumber()
  intraId: number;

  @ApiProperty({
    description: 'Username from 42 Intra API',
    example: 'jdoe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Email from 42 Intra API',
    example: 'jdoe@student.42urdiliz.com',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Avatar URL from 42 Intra API',
    example: 'https://cdn.intra.42.fr/users/jdoe.jpg',
  })
  @IsString()
  @IsUrl()
  avatar: string;
}
