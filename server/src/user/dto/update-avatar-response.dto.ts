import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';

export class UpdateAvatarResponseDto {
  @ApiProperty({
    description: swaggerConstants.dto.updateAvatar.updated.description,
    example: swaggerConstants.dto.updateAvatar.updated.example,
  })
  updated: number;

  @ApiProperty({
    description: swaggerConstants.dto.updateAvatar.data.description,
    example: swaggerConstants.dto.updateAvatar.data.example,
  })
  data: any;
}
