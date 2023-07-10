import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UsernameDto {
  @ApiProperty({
    description: 'Username from 42 Intra API',
    example: 'jdoe',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(12)
  username: string;
}
