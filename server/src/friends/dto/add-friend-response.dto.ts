import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';
import { UserWithFriendsDto } from './user-with-friends.dto';

export class AddFriendResponseDto {
  @ApiProperty({
    description: swaggerConstants.dto.addFriendResponse.created.description,
    example: swaggerConstants.dto.addFriendResponse.created.example,
  })
  @IsNumber()
  created: number;

  @ApiProperty({
    description: swaggerConstants.dto.addFriendResponse.data.description,
    example: swaggerConstants.dto.addFriendResponse.data.example,
  })
  data: UserWithFriendsDto;
}
