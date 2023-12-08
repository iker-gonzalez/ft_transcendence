import { User } from '@prisma/client';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class UserRommDTO {
  @IsUUID()
  id: string;

  @IsNumber()
  intraId: number;

  @IsString()
  username: string;

  @IsString()
  avatar: string;

  @IsString()
  roomName: string;

  constructor(user: User, roomName: string) {
    this.id = user.id;
    this.intraId = user.intraId;
    this.username = user.username;
    this.avatar = user.avatar;
    this.roomName = roomName;
  }
}
