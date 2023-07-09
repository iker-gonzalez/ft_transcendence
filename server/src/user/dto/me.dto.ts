import { UserDto } from './user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class MeDto {
  @ApiProperty({
    description: 'User data from database',
  })
  data: UserDto;
}
