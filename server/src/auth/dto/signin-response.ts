import { IsJWT, IsNumber } from 'class-validator';
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
    description: 'JWT token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjYzAyNGVmMi1mYjc5LTQwMGMtOGY5Ny1jZTBlNDlkN2RjNjgiLCJpYXQiOjE2ODg5MDkwMDEsImV4cCI6MTY4ODkxMDgwMX0.roOejlEwk0TtsSr_jId9wcIW5oRve_sX67HnGU74RWs',
  })
  @IsJWT()
  access_token: string;

  @ApiProperty({
    description: 'User data from database',
  })
  data: IntraUserDataDto;
}
