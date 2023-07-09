import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { User } from '@prisma/client';
import { MeDto } from './dto/me.dto';

@ApiTags('Users')
@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  @ApiOperation({
    summary: 'Retrieve user data from database',
  })
  @ApiOkResponse({
    description: 'Returns curretn user data from database.',
    type: MeDto,
  })
  @ApiUnauthorizedResponse({
    description: 'JWT token is invalid or expired.',
  })
  @Get('me')
  getme(@GetUser() user: User): MeDto {
    return { data: user };
  }
}
