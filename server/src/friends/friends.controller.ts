import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { FriendsService } from './friends.service';
import { swaggerConstants } from '../../config/swagger.constants';
import { AddFriendResponseDto } from './dto/add-friend-response.dto';

@ApiTags('Friends')
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('add/:friendId')
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
  @UseGuards(JwtGuard)
  async addFriend(
    @GetUser() user: User,
    @Param('friendId') friendIntraId: number,
  ): Promise<any> {
    if (isNaN(friendIntraId))
      throw new BadRequestException('You must provide a friend id');

    return this.friendsService.addFriend(Number(friendIntraId), user);
  }

  //   @Get(':friendId?')
  //   @ApiOperation({
  //     summary: swaggerConstants.friends.add.summary,
  //   })
  //   @ApiOkResponse({
  //     description: swaggerConstants.friends.add.ok.description,
  //   })
  //   @ApiBadRequestResponse({
  //     description: swaggerConstants.friends.add.bad.description,
  //   })
  //   @ApiUnauthorizedResponse({
  //     description: swaggerConstants.friends.add.unauthorized.description,
  //   })
  //   @UseGuards(JwtGuard)
  //   async getFriends(
  //     @GetUser() user: User,
  //     @Param('friendId') friendIntraId: number,
  //   ): Promise<any> {
  //     return this.friendsService.getFriends(Number(friendIntraId), user);
  //   }
}
