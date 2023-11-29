import { ChatMessage, DirectMessage, User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';
import { IsArray, IsHash, IsInt, IsOptional, IsString, IsUUID, isArray, isInt, isUUID } from 'class-validator';
import { Hash } from 'crypto';
import { isNull } from 'util';

export class RoomOwnerPasswordIntraDTO {
    
    @ApiProperty({
    description: swaggerConstants.dto.roomOwnerPasswordIntradto.data.description,
    example: swaggerConstants.dto.roomOwnerPasswordIntradto.data.example})

    @IsInt()
    ownerIntra: number;

    @IsOptional()
    @IsString() 
    password: string | null;
  }
  