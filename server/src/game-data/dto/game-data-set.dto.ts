import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

class GamePowerUp {
  @IsUUID()
  @IsString()
  id: string;

  @IsString()
  description: string;

  @IsBoolean()
  value: boolean;
}

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

  @IsObject()
  @IsOptional()
  powerUps?: GamePowerUp | null;
}
