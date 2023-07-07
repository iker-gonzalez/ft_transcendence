import { IsEmail, IsNumber, IsString, IsUrl } from 'class-validator';

export class IntraUserDataDto {
  @IsNumber()
  intraId: number;

  @IsString()
  username: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsUrl()
  avatar: string;
}
