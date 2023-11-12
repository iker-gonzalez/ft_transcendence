import { IsUUID, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';


export class AllUsersDMWithDTO {
    @ApiProperty({
        description: swaggerConstants.dto.allusersDMWithDTO.data.description,
        example: swaggerConstants.dto.allusersDMWithDTO.data.example,
      })

    @IsUUID()
    id: string;

    @IsString()
    avatar: string;

    @IsString()
    username: string;

    @IsNumber()
    intraId: number;

}
  