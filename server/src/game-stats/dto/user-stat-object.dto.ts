import { IsNumber, IsPositive, IsString, IsUrl } from 'class-validator';

export class UserStatObjectDto {
  @IsString()
  @IsUrl()
  avatar: string;

  @IsNumber()
  intraId: number;

  @IsString()
  username: string;

  @IsNumber()
  @IsPositive()
  count: number;
}
