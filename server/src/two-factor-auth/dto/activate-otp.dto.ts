import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { swaggerConstants } from '../../../config/swagger.constants';

export class ActivateOtpDto {
  @ApiProperty({
    description: swaggerConstants.dto.activateOtp.otpCode.description,
    example: swaggerConstants.dto.activateOtp.otpCode.example,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{6}$/)
  otp: string;
}
