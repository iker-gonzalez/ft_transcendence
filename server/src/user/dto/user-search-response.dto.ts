import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';
import UserCoreData from 'src/types/user-core-data.type';

export class UserSearchResponseDto {
  @ApiProperty({
    description: swaggerConstants.dto.userSearchResponse.found.description,
    example: swaggerConstants.dto.userSearchResponse.found.example,
  })
  found: number;

  @ApiProperty({
    description: swaggerConstants.dto.userSearchResponse.data.description,
    example: swaggerConstants.dto.userSearchResponse.data.example,
  })
  data: UserCoreData[];
}
