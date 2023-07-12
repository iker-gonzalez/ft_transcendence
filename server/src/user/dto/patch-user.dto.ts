import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';
import { swaggerConstants } from '../../../config/swagger.constants';

export class PatchUserDto {
  @ApiProperty({
    description: swaggerConstants.dto.updateName.updated.description,
    example: swaggerConstants.dto.updateName.updated.example,
  })
  updated: number;

  @ApiProperty({
    description: swaggerConstants.dto.signinResponse.data.description,
  })
  data: UserDto;
}
