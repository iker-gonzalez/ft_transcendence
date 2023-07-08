import { IsNumber } from 'class-validator';
import { IntraUserDataDto } from './intra-user-data.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SigninResponseDto {
  @ApiProperty({
    description: 'Number of created resources',
    example: 1,
  })
  @IsNumber()
  created: number;

  @ApiProperty({
    description: 'User data from database',
  })
  data: IntraUserDataDto;
}
