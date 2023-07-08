import { IsNumber } from 'class-validator';
import { IntraUserDataDto } from './intra-user-data.dto';

export class SigninResponseDto {
  @IsNumber()
  created: number;

  data: IntraUserDataDto;
}
