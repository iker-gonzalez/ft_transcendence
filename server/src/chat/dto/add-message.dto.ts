import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';
import { UserWithDirectMessageDto } from './user-with-direct-message.dto';

export class AddMessageToUserDto {
  // @ApiProperty({
  //   description: swaggerConstants.dto.addFriendResponse.created.description,
  //   example: swaggerConstants.dto.addFriendResponse.created.example,
  // })
  @IsNumber()
  created: number;

  // @ApiProperty({
  //   description: swaggerConstants.dto.addFriendResponse.data.description,
  //   example: swaggerConstants.dto.addFriendResponse.data.example,
  // })
  data: UserWithDirectMessageDto;
}
