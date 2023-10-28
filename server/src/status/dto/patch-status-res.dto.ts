import { swaggerConstants } from '../../../config/swagger.constants';
import { ApiProperty } from '@nestjs/swagger';

export class PatchStatusResDataDto {
  status: string;
  intraId: number;
}

export class PatchStatusResDto {
  @ApiProperty({
    description: swaggerConstants.dto.patchStatusResDto.updated.description,
    example: swaggerConstants.dto.patchStatusResDto.updated.example,
  })
  updated: number;

  @ApiProperty({
    description: swaggerConstants.dto.patchStatusResDto.data.description,
    example: swaggerConstants.dto.patchStatusResDto.data.example,
  })
  data: PatchStatusResDataDto;
}
