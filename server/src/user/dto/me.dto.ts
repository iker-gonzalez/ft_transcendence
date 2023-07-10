import { swaggerConstants } from '../../../config/swagger.constants';
import { UserDto } from './user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class MeDto {
  @ApiProperty({
    description: swaggerConstants.dto.signinResponse.data.description,
  })
  data: UserDto;
}
