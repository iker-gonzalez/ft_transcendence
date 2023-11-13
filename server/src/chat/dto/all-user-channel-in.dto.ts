
import { IsUUID, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';


export class AllUserChannelInDTO {
    @ApiProperty({
        description: swaggerConstants.dto.allUserChannelInDTO.data.description,
        example: swaggerConstants.dto.allUserChannelInDTO.data.example,
      })

    @IsString()
    name: string;

}
  