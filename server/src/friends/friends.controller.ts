import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { FriendsService } from './friends.service';
import { swaggerConstants } from '../../config/swagger.constants';
import { AddFriendResponseDto } from './dto/add-friend-response.dto';
import { GetFriendsResponseDto } from './dto/get-friends-response.dto';
import { DeleteFriendResponseDto } from './dto/delete-friend-response.dto';
import { GetFriendsParamsDto } from './dto/get-friends-params.dto';
import { FriendsParamsDto } from './dto/friends-params.dto';

@ApiTags('Friends')
@Controller('friends')
@UseGuards(JwtGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post(':friendId')
  @ApiOperation({
    summary: swaggerConstants.friends.add.summary,
  })
  @ApiOkResponse({
    description: swaggerConstants.friends.add.ok.description,
    type: AddFriendResponseDto,
  })
  @ApiBadRequestResponse({
    description: swaggerConstants.friends.add.bad.description,
  })
  @ApiConflictResponse({
    description: swaggerConstants.friends.add.conflict.description,
  })
  @ApiUnauthorizedResponse({
    description: swaggerConstants.friends.add.unauthorized.description,
  })
  @HttpCode(HttpStatus.OK)
  addFriend(
    @GetUser() user: User,
    @Param() params: FriendsParamsDto,
  ): Promise<any> {
    return this.friendsService.addFriend(Number(params.friendId), user);
  }

  @Get(':friendId?')
  @ApiParam({
    name: 'friendId',
    required: false,
  })
  @ApiOperation({
    summary: swaggerConstants.friends.get.summary,
  })
  @ApiOkResponse({
    description: swaggerConstants.friends.get.ok.description,
    type: GetFriendsResponseDto,
  })
  @ApiNotFoundResponse({
    description: swaggerConstants.friends.get.notFound.description,
  })
  @ApiUnauthorizedResponse({
    description: swaggerConstants.friends.get.unauthorized.description,
  })
  getFriends(
    @GetUser() user: User,
    @Param() params: GetFriendsParamsDto,
  ): Promise<GetFriendsResponseDto> {
    return this.friendsService.getFriends(params.friendId, user);
  }

  @Delete(':friendId')
  @ApiOperation({
    summary: swaggerConstants.friends.delete.summary,
  })
  @ApiOkResponse({
    description: swaggerConstants.friends.delete.ok.description,
    type: DeleteFriendResponseDto,
  })
  @ApiBadRequestResponse({
    description: swaggerConstants.friends.delete.bad.description,
  })
  @ApiUnauthorizedResponse({
    description: swaggerConstants.friends.delete.unauthorized.description,
  })
  deleteFriend(
    @GetUser() user: User,
    @Param() params: FriendsParamsDto,
  ): Promise<any> {
    return this.friendsService.deleteFriend(Number(params.friendId), user);
  }
}
