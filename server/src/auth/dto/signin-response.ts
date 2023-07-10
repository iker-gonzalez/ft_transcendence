import { IsJWT, IsNumber } from 'class-validator';
import { IntraUserDataDto } from './intra-user-data.dto';
import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';

export class SigninResponseDto {
  @ApiProperty({
    description: swaggerConstants.dto.signinResponse.created.description,
    example: swaggerConstants.dto.signinResponse.created.example,
  })
  @IsNumber()
  created: number;

  @ApiProperty({
    description: swaggerConstants.dto.signinResponse.access_token.description,
    example: swaggerConstants.dto.signinResponse.access_token.example,
  })
  @IsJWT()
  access_token: string;

  @ApiProperty({
    description: swaggerConstants.dto.signinResponse.data.description,
  })
  data: IntraUserDataDto;
}
