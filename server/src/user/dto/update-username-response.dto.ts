import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';

export class UpdateUsernameResponseDto {
  @ApiProperty({
    description: swaggerConstants.dto.updateName.updated.description,
    example: swaggerConstants.dto.updateName.updated.example,
  })
  updated: number;

  @ApiProperty({
    description: swaggerConstants.dto.updateName.data.description,
    example: swaggerConstants.dto.updateName.data.example,
  })
  data: any;
}
