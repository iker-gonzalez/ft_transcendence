import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class UpdateNameDto {
  @ApiProperty({
    description: 'Number of resources updated',
    example: 1,
  })
  updated: number;

  @ApiProperty({
    description: 'Updated user data',
  })
  data: UserDto;
}
