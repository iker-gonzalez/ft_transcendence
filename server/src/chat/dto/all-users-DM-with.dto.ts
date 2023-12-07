import { IsUUID, IsString, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';


export class AllUsersDMWithDTO {
  @ApiProperty({
    description: swaggerConstants.dto.allUserDMWithDTO.data.description,
    example: swaggerConstants.dto.allUserDMWithDTO.data.example,
  })

  @IsUUID()
  id: string;

  @IsString()
  avatar: string;

  @IsString()
  username: string;

  @IsNumber()
  intraId: number;

  @IsBoolean()
  isBlocked: boolean;

}
