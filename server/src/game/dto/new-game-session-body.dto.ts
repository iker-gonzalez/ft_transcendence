import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';
import { IsString } from 'class-validator';

export class NewGameSessionBodyDto {
  @ApiProperty({
    description: swaggerConstants.dto.newSessionDto.ball.description,
    example: swaggerConstants.dto.newSessionDto.ball.example,
  })
  @IsString()
  ball: string;
}
