import { DirectMessage } from '@prisma/client';
import { IsArray, IsInt, IsUUID, isArray, isInt, isUUID } from 'class-validator';

export class UserWithDirectMessageDto {
  @IsUUID()
  id: string;

  @IsInt()
  intraId: number;

  @IsArray()
  sendMessages: DirectMessage[];

  @IsArray()
  receivedMessages: DirectMessage[];
}
