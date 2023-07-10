import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { User } from '@prisma/client';
import { MeDto } from './dto/me.dto';
import { UsernameDto } from './dto/username.dto';
import { UserService } from './user.service';
import { UpdateNameDto } from './dto/update-name.dto';
import { swaggerConstants } from '../../config/swagger.constants';

@ApiTags('Users')
@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: swaggerConstants.users.me.summary,
  })
  @ApiOkResponse({
    description: swaggerConstants.users.me.ok.description,
    type: MeDto,
  })
  @ApiUnauthorizedResponse({
    description: swaggerConstants.users.me.unauthorized.description,
  })
  @Get('me')
  getme(@GetUser() user: User): MeDto {
    return { data: user };
  }

  @ApiOperation({
    summary: swaggerConstants.users.username.summary,
  })
  @ApiOkResponse({
    description: swaggerConstants.users.username.ok.description,
    type: UpdateNameDto,
  })
  @ApiUnauthorizedResponse({
    description: swaggerConstants.users.username.unauthorized.description,
  })
  @ApiBadRequestResponse({
    description: swaggerConstants.users.username.bad.description,
  })
  @Patch(':id/username')
  updateUsername(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() body: UsernameDto,
  ): Promise<UpdateNameDto> {
    return this.userService.updateUsername(user, id, body.username);
  }
}
