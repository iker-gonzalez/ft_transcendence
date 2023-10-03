import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { swaggerConstants } from 'config/swagger.constants';

export class UserSearchParamsDto {
  @ApiProperty({
    description: swaggerConstants.dto.userSearchQuery.description,
    example: swaggerConstants.dto.userSearchQuery.example,
  })
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  @Matches(/^\S*$/, {
    message: 'query should not include spaces',
  })
  query: string;
}
