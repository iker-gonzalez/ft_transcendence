import { ChatMessage, DirectMessage, User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';
import { IsArray, IsInt, IsUUID, isArray, isInt, isUUID } from 'class-validator';

export class RoomOwnerIntraDTO {
     @ApiProperty({
    description: swaggerConstants.dto.roomOwnerIntraDTO.data.description,
    example: swaggerConstants.dto.roomOwnerIntraDTO.data.example,
  })
    @IsInt()
    ownerIntra: number;
  }
  