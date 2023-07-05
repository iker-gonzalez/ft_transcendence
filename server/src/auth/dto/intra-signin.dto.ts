import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class IntraSigninDto {
  @IsString()
  code: string;

  @IsString()
  @Matches(new RegExp(process.env.INTRA_STATE), {
    message: 'State value is not valid',
  })
  state: string;
}
