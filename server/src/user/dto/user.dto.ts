import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class UserDto implements User {
  @ApiProperty({
    description: 'User ID',
    example: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
  })
  id: string;

  @ApiProperty({
    description: 'Profile creation date',
    example: new Date(Date.now() - 86400000),
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Profile last update date',
    example: new Date(),
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'User ID from 42 Intra API',
    example: 12345,
  })
  intraId: number;

  @ApiProperty({
    description: 'Username from 42 Intra API',
    example: 'jdoe',
  })
  username: string;

  @ApiProperty({
    description: 'Avatar URL from 42 Intra API',
    example: 'https://cdn.intra.42.fr/users/jdoe.jpg',
  })
  avatar: string;

  @ApiProperty({
    description: 'Email from 42 Intra API',
    example: 'doe@student.42urdiliz.com',
  })
  email: string;
}
