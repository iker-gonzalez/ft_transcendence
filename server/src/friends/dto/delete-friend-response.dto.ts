import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';
import { UserWithFriendsDto } from './user-with-friends.dto';

export class DeleteFriendResponseDto {
  @ApiProperty({
    description: swaggerConstants.dto.deleteFriendResponse.deleted.description,
    example: swaggerConstants.dto.deleteFriendResponse.deleted.example,
  })
  @IsNumber()
  deleted: number;

  @ApiProperty({
    description: swaggerConstants.dto.deleteFriendResponse.data.description,
    example: swaggerConstants.dto.deleteFriendResponse.data.example,
  })
  data: UserWithFriendsDto;
}
