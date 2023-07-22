import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';
import { swaggerConstants } from '../../../config/swagger.constants';

export class OtpAuthUrlDto {
  @ApiProperty({
    description: swaggerConstants.dto.twoFactorSecret.otpauthUrl.description,
    example: swaggerConstants.dto.twoFactorSecret.otpauthUrl.example,
  })
  @IsString()
  @IsUrl()
  otpauthUrl: string;
}
