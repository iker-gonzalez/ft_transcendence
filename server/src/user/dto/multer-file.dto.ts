import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';
import {
  Equals,
  IsInt,
  IsMimeType,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class MulterFileDto implements Express.Multer.File {
  @ApiProperty({
    description: 'Fieldname of the form field associated with the file',
    example: 'avatar',
  })
  @Equals('avatar')
  @IsString()
  fieldname: string;

  @ApiProperty({
    description: 'Original name of the file on the user’s computer',
    example: 'avatar.jpg',
  })
  @IsString()
  originalname: string;

  @IsString()
  encoding: string;

  @IsMimeType()
  @IsString()
  mimetype: string;

  @IsInt()
  @Min(50000)
  @Max(5000000)
  size: number;

  buffer: Buffer;

  stream: any;
  destination: string;
  filename: string;
  path: string;
}
