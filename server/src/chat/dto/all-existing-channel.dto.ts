import { IsUUID, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';


export class AllExistingChannelsDTO {
    @ApiProperty({
        description: swaggerConstants.dto.allExistingChannelsDTO.data.description,
        example: swaggerConstants.dto.allExistingChannelsDTO.data.example,
      }) 

    @IsUUID()
    name: string;

    @IsString()
    type: string;

}
  