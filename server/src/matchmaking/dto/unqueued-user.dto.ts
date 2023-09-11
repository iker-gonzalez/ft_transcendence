import { IsBoolean, IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { swaggerAsyncConstants } from '../../../config/swagger-async.constants';

export class UnqueuedUserDto {
  @ApiProperty({
    description: swaggerAsyncConstants.dtos.unqueuedUser.queued.description,
    example: swaggerAsyncConstants.dtos.unqueuedUser.queued.example,
  })
  @IsBoolean()
  @IsDefined()
  queued: boolean;
}
