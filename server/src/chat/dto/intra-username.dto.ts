import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';
import { use } from 'passport';


export class IntraUsernameDTO {
  //  @ApiProperty({
  //      description: swaggerConstants.dto.allExistingChannelsDTO.data.description,
  //      example: swaggerConstants.dto.allExistingChannelsDTO.data.example,
  //    }) 


  @IsNumber()
  intra: number;

  @IsString()
  username: string;

  constructor(intra: number, username: string) {
    this.intra = intra;
    this.username = username;
  }

}
