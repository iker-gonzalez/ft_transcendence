import { IntraUserDataDto } from '../../auth/dto/intra-user-data.dto';
import { swaggerConstants } from '../../../config/swagger.constants';
import { ApiProperty } from '@nestjs/swagger';

export class MeDto {
  @ApiProperty({
    description: swaggerConstants.dto.userDto.id.description,
    example: swaggerConstants.dto.userDto.id.example,
  })
  id: string;

  @ApiProperty({
    description: swaggerConstants.dto.userDto.createdAt.description,
    example: swaggerConstants.dto.userDto.createdAt.example,
  })
  createdAt: Date;

  @ApiProperty({
    description: swaggerConstants.dto.userDto.updatedAt.description,
    example: swaggerConstants.dto.userDto.updatedAt.example,
  })
  updatedAt: Date;

  @ApiProperty({
    description: swaggerConstants.dto.signinResponse.data.description,
  })
  data: IntraUserDataDto;
}
