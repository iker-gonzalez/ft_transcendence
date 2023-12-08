import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';
import { IsInt } from 'class-validator';

export class RoomOwnerIntraDTO {
  @ApiProperty({
    description: swaggerConstants.dto.roomOwnerIntraDTO.data.description,
    example: swaggerConstants.dto.roomOwnerIntraDTO.data.example,
  })
  @IsInt()
  ownerIntra: number;
}
