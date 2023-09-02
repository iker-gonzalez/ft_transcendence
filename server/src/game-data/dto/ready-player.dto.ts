import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';
import { swaggerAsyncConstants } from '../../../config/swagger-async.constants';

export class ReadyPlayerDto {
  @ApiProperty({
    description: swaggerAsyncConstants.dtos.startGameDto.gameDataId.description,
    example: swaggerAsyncConstants.dtos.startGameDto.gameDataId.example,
  })
  @IsString()
  gameDataId: string;

  @ApiProperty({
    description: swaggerAsyncConstants.dtos.readyPlayerDto.isUser1.description,
    example: swaggerAsyncConstants.dtos.readyPlayerDto.isUser1.example,
  })
  @IsBoolean()
  isUser1: boolean;
}
