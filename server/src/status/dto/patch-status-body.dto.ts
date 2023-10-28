import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';
import { swaggerConstants } from '../../../config/swagger.constants';

export class PatchStatusBodyDto {
  @ApiProperty({
    description: swaggerConstants.dto.patchStatusBodyDto.status.description,
    example: swaggerConstants.dto.patchStatusBodyDto.status.example,
  })
  @IsString()
  @IsEnum(UserStatus)
  status: UserStatus;
}
