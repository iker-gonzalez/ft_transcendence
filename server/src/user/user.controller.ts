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

@ApiTags('Users')
@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'Retrieve user data from database',
  })
  @ApiOkResponse({
    description: 'Returns current user data from database.',
    type: MeDto,
  })
  @ApiUnauthorizedResponse({
    description: 'JWT token is invalid or expired.',
  })
  @Get('me')
  getme(@GetUser() user: User): MeDto {
    return { data: user };
  }

  @ApiOperation({
    summary: 'Update username',
  })
  @ApiOkResponse({
    description: 'Returns updated user data.',
    type: UpdateNameDto,
  })
  @ApiUnauthorizedResponse({
    description: 'JWT token is invalid or expired.',
  })
  @ApiBadRequestResponse({
    description:
      'Username is not valid or provided id does not match current user.',
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
