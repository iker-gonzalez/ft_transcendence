import { IsDefined, IsInt, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class NewQueuedUserDto {
  @Type(() => Number)
  @IsNumber()
  @IsDefined()
  @IsPositive()
  @IsInt()
  intraId: number;
}
