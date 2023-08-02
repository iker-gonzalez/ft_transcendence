import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';
import { UserWithFriendsDto } from './user-with-friends.dto';

export class GetFriendsResponseDto {
  @ApiProperty({
    description: swaggerConstants.dto.getFriendsResponse.found.description,
    example: swaggerConstants.dto.getFriendsResponse.found.example,
  })
  @IsNumber()
  found: number;

  @ApiProperty({
    description: swaggerConstants.dto.getFriendsResponse.data.description,
    example: swaggerConstants.dto.getFriendsResponse.data.example,
  })
  data: UserWithFriendsDto;
}
