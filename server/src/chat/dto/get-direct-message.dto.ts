import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';
import { UserWithDirectMessageDto } from './user-with-direct-message.dto';
import { IsNumber } from 'class-validator';

export class GetDirectMessageDto {
  @IsNumber()
  found: number;

 // @ApiProperty({
 //   description: swaggerConstants.dto.getFriendsResponse.data.description,
 //   example: swaggerConstants.dto.getFriendsResponse.data.example,
 // })
  data: UserWithDirectMessageDto;
}
