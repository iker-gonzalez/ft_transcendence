import { ChatMessage, DirectMessage, User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';
import { IsArray, IsHash, IsInt, IsString, IsUUID, isArray, isInt, isUUID } from 'class-validator';
import { Hash } from 'crypto';

export class RoomOwnerIntraDTO {
     @ApiProperty({
    description: swaggerConstants.dto.roomOwnerIntraDTO.data.description,
    example: swaggerConstants.dto.roomOwnerIntraDTO.data.example,
  })
    @IsInt()
    ownerIntra: number;
  }
  