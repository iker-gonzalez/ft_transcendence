import { Friend } from '@prisma/client';
import { IsArray, IsInt, IsUUID } from 'class-validator';

export class UserWithFriendsDto {
  @IsUUID()
  id: string;

  @IsInt()
  intraId: number;

  @IsArray()
  friends: Friend[];
}
