import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class GameDataDto {
  @IsObject()
  user1: any;

  @IsObject()
  user2: any;

  @IsObject()
  ball: any;

  @IsBoolean()
  @IsOptional()
  isUser1?: boolean;
}
