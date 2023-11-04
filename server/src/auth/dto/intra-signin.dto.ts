import { ConfigService } from '@nestjs/config';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';
import { configModuleOptions } from '../../../config/app.config';
import { swaggerConstants } from '../../../config/swagger.constants';

const configService = new ConfigService(configModuleOptions);

export class IntraSigninDto {
  @ApiProperty({
    description: swaggerConstants.dto.intraSignin.code.description,
    example: swaggerConstants.dto.intraSignin.code.example,
  })
  @IsString()
  code: string;

  @ApiPropertyOptional({
    description: swaggerConstants.dto.intraSignin.otpCode.description,
    example: swaggerConstants.dto.intraSignin.otpCode.example,
  })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{6}$/)
  otp?: string;

  @ApiProperty({
    description: swaggerConstants.dto.intraSignin.state.description,
    example: swaggerConstants.dto.intraSignin.state.example,
  })
  @IsString()
  @Matches(new RegExp(configService.get<string>('INTRA_STATE')), {
    message: 'State value is not valid',
  })
  state: string;
}
