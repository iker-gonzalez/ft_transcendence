import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';
import { swaggerAsyncConstants } from '../../../config/swagger-async.constants';

export class StartGameDto {
  @ApiProperty({
    description: swaggerAsyncConstants.dtos.startGameDto.gameDataId.description,
    example: swaggerAsyncConstants.dtos.startGameDto.gameDataId.example,
  })
  @IsString()
  gameDataId: string;

  @ApiProperty({
    description: swaggerAsyncConstants.dtos.startGameDto.ball.description,
    example: swaggerAsyncConstants.dtos.startGameDto.ball.example,
  })
  @IsObject()
  ball: any;

  @ApiProperty({
    description: swaggerAsyncConstants.dtos.startGameDto.user1.description,
    example: swaggerAsyncConstants.dtos.startGameDto.user1.example,
  })
  @IsObject()
  user1: any;

  @ApiProperty({
    description: swaggerAsyncConstants.dtos.startGameDto.user2.description,
    example: swaggerAsyncConstants.dtos.startGameDto.user2.example,
  })
  @IsObject()
  user2: any;
}
