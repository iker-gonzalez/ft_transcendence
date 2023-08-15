import { IsDefined, IsInt, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { swaggerAsyncConstants } from 'config/swagger-async.constants';

export class NewQueuedUserDto {
  @ApiProperty({
    description: swaggerAsyncConstants.dtos.newQueuedUser.intraId.description,
    example: swaggerAsyncConstants.dtos.newQueuedUser.intraId.example,
  })
  @Type(() => Number)
  @IsNumber()
  @IsDefined()
  @IsPositive()
  @IsInt()
  intraId: number;
}
