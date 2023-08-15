import { ApiProperty } from '@nestjs/swagger';
import { UserGameSession } from '@prisma/client';
import { IsBoolean, IsObject } from 'class-validator';
import { swaggerAsyncConstants } from 'config/swagger-async.constants';

export class NewQueuedUserResponseDto {
  @ApiProperty({
    description:
      swaggerAsyncConstants.dtos.newQueuedUserResponse.success.description,
    example: swaggerAsyncConstants.dtos.newQueuedUserResponse.success.example,
  })
  @IsBoolean()
  success: boolean;

  @ApiProperty({
    description:
      swaggerAsyncConstants.dtos.newQueuedUserResponse.data.description,
    example: swaggerAsyncConstants.dtos.newQueuedUserResponse.data.example,
  })
  @IsObject()
  data: UserGameSession;
}
