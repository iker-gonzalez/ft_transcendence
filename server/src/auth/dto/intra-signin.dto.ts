import { ConfigService } from '@nestjs/config';
import { IsString, Matches } from 'class-validator';
import { configModuleOptions } from 'config/app.config';

const configService = new ConfigService(configModuleOptions);

export class IntraSigninDto {
  @IsString()
  code: string;

  @IsString()
  @Matches(new RegExp(configService.get<string>('INTRA_STATE')), {
    message: 'State value is not valid',
  })
  state: string;
}
