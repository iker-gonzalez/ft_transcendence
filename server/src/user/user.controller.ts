import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
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
import { swaggerConstants } from '../../config/swagger.constants';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterFileDto } from './dto/multer-file.dto';
import { UpdateUsernameResponseDto } from './dto/update-username-response.dto';
import { UpdateAvatarResponseDto } from './dto/update-avatar-response.dto';
import { UserSearchResponseDto } from './dto/user-search-response.dto';
import { UserSearchParamsDto } from './dto/user-search-params.dto';

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
    // Do not share secret with client
    delete user.twoFactorAuthSecret;

    const {
      avatar,
      createdAt,
      email,
      id,
      intraId,
      isTwoFactorAuthEnabled,
      updatedAt,
      username,
    } = user;
    return {
      id,
      createdAt,
      updatedAt,
      data: { avatar, email, intraId, isTwoFactorAuthEnabled, username },
    };
  }

  @ApiOperation({
    summary: swaggerConstants.users.username.summary,
  })
  @ApiOkResponse({
    description: swaggerConstants.users.username.ok.description,
    type: UpdateUsernameResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: swaggerConstants.users.username.unauthorized.description,
  })
  @ApiBadRequestResponse({
    description: swaggerConstants.users.username.bad.description,
  })
  @Patch('/username')
  updateUsername(
    @GetUser() user: User,
    @Body() body: UsernameDto,
  ): Promise<UpdateUsernameResponseDto> {
    return this.userService.updateUsername(user, body.username);
  }

  @ApiOperation({
    summary: swaggerConstants.users.avatar.summary,
  })
  @ApiOkResponse({
    description: swaggerConstants.users.avatar.ok.description,
    type: UpdateAvatarResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: swaggerConstants.users.avatar.unauthorized.description,
  })
  @ApiBadRequestResponse({
    description: swaggerConstants.users.avatar.bad.description,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
    description: swaggerConstants.users.avatar.body.description,
  })
  @Patch('/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  updateAvatar(
    @GetUser() user: User,
    @UploadedFile() file: MulterFileDto,
  ): Promise<UpdateAvatarResponseDto> {
    return this.userService.updateAvatar(user, file);
  }

  @ApiOperation({
    summary: swaggerConstants.users.search.summary,
  })
  @ApiOkResponse({
    description: swaggerConstants.users.search.ok.description,
    type: UserSearchResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: swaggerConstants.users.search.unauthorized.description,
  })
  @Get('/search')
  getUsersByName(
    @Query() params: UserSearchParamsDto,
  ): Promise<UserSearchResponseDto> {
    return this.userService.getUsersByName(params.query);
  }
}
