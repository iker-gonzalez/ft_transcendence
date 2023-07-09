import { ConfigService } from '@nestjs/config';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import { configModuleOptions } from '../../../config/app.config';

const configService = new ConfigService(configModuleOptions);

export class IntraSigninDto {
  @ApiProperty({
    description: 'Code provided by 42 Intra API',
    example: '2347e735860cd289bcefb543fe19238d25ed32255b02d566104c2c8d6a150689',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'State value required by 42 Intra API to prevent CSRF',
    example: 'aC1b4gdseU1ka4VFhYLJqFSEWu1ZFk9A',
  })
  @IsString()
  @Matches(new RegExp(configService.get<string>('INTRA_STATE')), {
    message: 'State value is not valid',
  })
  state: string;
}
