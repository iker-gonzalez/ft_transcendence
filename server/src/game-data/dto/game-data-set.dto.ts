import { IsBoolean, IsString, IsUUID } from 'class-validator';

export class GameDataSetDto {
  @IsString()
  @IsUUID()
  gameDataId: string;

  @IsString()
  gameData: string;

  @IsBoolean()
  user1Ready: boolean;

  @IsBoolean()
  user2Ready: boolean;
}
