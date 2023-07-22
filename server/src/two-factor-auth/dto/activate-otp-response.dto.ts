import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';
import { swaggerConstants } from '../../../config/swagger.constants';

export class ActivateOtpResponseDto {
  @ApiProperty({
    description: swaggerConstants.dto.activateOtpResponse.updated.description,
    example: swaggerConstants.dto.activateOtpResponse.updated.example,
  })
  @IsInt()
  @Min(0)
  @Max(1)
  updated: number;
}
