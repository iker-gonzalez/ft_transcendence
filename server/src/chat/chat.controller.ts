import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ChatDMService } from './service/chatDM.service';
import { swaggerConstants } from '../../config/swagger.constants';
import { ChatChannelService } from './service/chatChannel.service';
import { AllUsersDMWithDTO } from './dto/all-users-DM-with.dto';
import { ConversationMessageDTO } from './dto/conversation-message.dto';
import { AllExistingChannelsDTO } from './dto/all-existing-channel.dto';
import { AllUserChannelInDTO } from './dto/all-user-channel-in.dto';
import { ChannelType, ChatRoomUser, User } from '@prisma/client';
import { AllChannelInfo } from './dto/all-channel-info.dto';
import { RoomOwnerIntraDTO } from './dto/roomOwnerIntra.dto';
import { RoomOwnerPasswordIntraDTO } from './dto/room-owener-password.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtGuard)
export class ChatController {
  constructor(
    private readonly chatDMService: ChatDMService,
    private readonly chatChannelService: ChatChannelService,
  ) {}
  /********************************************************** */
  //                         DM                               //
  /********************************************************** */
  @Get(':userId1/:userId2/DM') // Define la ruta para los parámetros userId1 y userId2
  @ApiParam({ name: 'userId1' })
  @ApiParam({ name: 'userId2' })
  @ApiOperation({
    summary: swaggerConstants.chat.data.summary,
  })
  @ApiOkResponse({
    description: swaggerConstants.chat.data.ok.description,
    type: ConversationMessageDTO,
  })
  async getDMBetweenUsers(
    @Param('userId1') userIntraId1: string,
    @Param('userId2') userIntraId2: string,
  ): Promise<ConversationMessageDTO[]> {
    try {
      const userId1 = await this.chatDMService.findUserIdByIntraId(
        parseInt(userIntraId1, 10),
      );
      const userId2 = await this.chatDMService.findUserIdByIntraId(
        parseInt(userIntraId2, 10),
      );
      return await this.chatDMService.getDMBetweenUsers(userId1, userId2);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  @Get(':userId/DM') // Define una nueva ruta para el método getAllUserDMWith
  @ApiParam({ name: 'userId' })
  @ApiOperation({
    summary: swaggerConstants.chat.all.summary,
  })
  @ApiOkResponse({
    description: swaggerConstants.chat.all.ok.description,
    type: AllUsersDMWithDTO,
  })
  async getAllUserDMWith(@Param('userId') userIntraId: string): Promise<any[]> {
    const userId = await this.chatDMService.findUserIdByIntraId(
      parseInt(userIntraId, 10),
    );

    try {
      return await this.chatDMService.getAllUserDMWith(userId);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  @Patch(':userIntra/:ToBlockIntra/:b_block/blockUser')
  @ApiParam({ name: 'userIntra' })
  @ApiParam({ name: 'ToBlockIntra' })
  @ApiParam({ name: 'b_block' })
  @ApiOperation({
    summary: swaggerConstants.chat.block.summary,
  })
  async patchBlockUser(
    @Param('userIntra') userIntra: string,
    @Param('ToBlockIntra') ToBlockIntra: string,
    @Param('b_block') b_block: number,
  ): Promise<void> {
    try {
      const userId = await this.chatDMService.findUserIdByIntraId(
        parseInt(userIntra, 10),
      );
      const ToBlockId = await this.chatDMService.findUserIdByIntraId(
        parseInt(ToBlockIntra, 10),
      );
      if (b_block == 1) {
        return this.chatDMService.blockUserDM(userId, ToBlockId);
      } else return this.chatDMService.unblockUserDM(userId, ToBlockId);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  /********************************************************** */
  //                    CHANNEL                               //
  /********************************************************** */

  @Get('/allExistingChannel')
  @ApiOperation({
    summary: swaggerConstants.chat.allExistingChannel.summary,
  })
  @ApiOkResponse({
    description: swaggerConstants.chat.allExistingChannel.ok.description,
    type: AllExistingChannelsDTO,
  })
  async getAllExistingChannels(): Promise<any[]> {
    try {
      return this.chatChannelService.getAllExistingChannels();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  @Get('bannedUsers')
  async getBannedUsersPerChannel(): Promise<{
    found: number;
    data: { name: string; bannedUsers: ChatRoomUser[] }[];
  }> {
    return this.chatChannelService.getBannedUser();
  }

  @Get(':userIntra/CM')
  @ApiParam({ name: 'userIntra' })
  @ApiOperation({
    summary: swaggerConstants.chat.allUserChannelIn.summary,
  })
  @ApiOkResponse({
    description: swaggerConstants.chat.allUserChannelIn.ok.description,
    type: AllUserChannelInDTO,
  })
  async getAllUserChannelIn(
    @Param('userIntra') userIntraId: string,
  ): Promise<any[]> {
    try {
      const userId = await this.chatDMService.findUserIdByIntraId(
        parseInt(userIntraId, 10),
      );
      return this.chatChannelService.getAllUserChannelIn(userId);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  @Get(':roomName/allChannel')
  @ApiParam({ name: 'roomName' })
  @ApiOperation({
    summary: swaggerConstants.chat.channelMess.summary,
  })
  @ApiOkResponse({
    description: swaggerConstants.chat.channelMess.ok.description,
    type: AllChannelInfo,
  })
  async getMessageInRoom(
    @Param('roomName') roomName: string,
  ): Promise<AllChannelInfo[]> {
    try {
      return this.chatChannelService.getMessageInRoom(roomName);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  /********************************************************** */
  //                     ADMIN FUNCIONALITY                   //
  /********************************************************** */

  @Patch(':channelRoom/:setAdminIntra/:b_add/setAdmin')
  @ApiParam({ name: 'channelRoom' })
  @ApiParam({ name: 'setAdminIntra' })
  @ApiParam({ name: 'b_add' })
  @ApiBody({
    description: 'JSON body with the ownerIntra',
    type: RoomOwnerIntraDTO,
  })
  @ApiOperation({
    summary: swaggerConstants.chat.addAdmin.summary,
  })
  async patchsetAddminToChannel(
    @Param('channelRoom') channelRoom: string,
    @Param('setAdminIntra') setAdminIntra: string,
    @Param('b_add') b_add: number,
    @Body() paydload: RoomOwnerIntraDTO,
  ): Promise<void> {
    try {
      const ownerId = await this.chatDMService.findUserIdByIntraId(
        paydload.ownerIntra,
      );
      const newAdminId = await this.chatDMService.findUserIdByIntraId(
        parseInt(setAdminIntra, 10),
      );
      if (b_add == 1) {
        this.chatChannelService.addAddminToChannel(
          channelRoom,
          ownerId,
          newAdminId,
        );
      } else {
        this.chatChannelService.deleteAddminToChannel(
          channelRoom,
          ownerId,
          newAdminId,
        );
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  @Get(':channelRoom/mutedUsers')
  async getMutedUsers(@Param('channelRoom') channelRoom: string) {
    return this.chatChannelService.getMutedUsers(channelRoom);
  }

  @Patch(':channelRoom/:userToMuteIntra/:b_mute/setMute')
  @ApiParam({ name: 'channelRoom' })
  @ApiParam({ name: 'userToMuteIntra' })
  @ApiParam({ name: 'b_mute' })
  @ApiBody({
    description: 'JSON body with the ownerIntra',
    type: RoomOwnerIntraDTO,
  })
  @ApiOperation({
    summary: swaggerConstants.chat.muteUser.summary,
  })
  async patchMuteUserToChannel(
    @Param('channelRoom') channelRoom: string,
    @Param('userToMuteIntra') userToMuteIntra: string,
    @Param('b_mute') b_mute: number,
    @Body() paydload: RoomOwnerIntraDTO,
  ): Promise<void> {
    const ownerId = await this.chatDMService.findUserIdByIntraId(
      paydload.ownerIntra,
    );
    const userToMuteId = await this.chatDMService.findUserIdByIntraId(
      parseInt(userToMuteIntra, 10),
    );

    if (!ownerId || !userToMuteId) {
      throw new BadRequestException('Invalid user id');
    }

    if (b_mute == 1)
      return this.chatChannelService.muteUserInChannel(
        channelRoom,
        ownerId,
        userToMuteId,
      );
    else
      return this.chatChannelService.unmuteUserInChannel(
        channelRoom,
        ownerId,
        userToMuteId,
      );
  }

  @Patch(':channelRoom/updatePassword')
  @ApiParam({ name: 'channelRoom' })
  @ApiParam({ name: 'ownerIntra' })
  @ApiParam({ name: 'password' })
  @ApiBody({
    description: 'JSON body with the ownerIntra',
    type: RoomOwnerPasswordIntraDTO,
  })
  @ApiOperation({
    summary: swaggerConstants.chat.addOrModifyPassword.summary,
  })
  async updateChannelPassword(
    @Param('channelRoom') channelRoom: string,
    @Param('userToMuteIntra') userToMuteIntra: string,
    @Param('b_mute') b_mute: number,
    @Body() paydload: RoomOwnerPasswordIntraDTO,
  ): Promise<void> {
    const ownerId = await this.chatDMService.findUserIdByIntraId(
      paydload.ownerIntra,
    );
    if (paydload.password != null) {
      return this.chatChannelService.modifyPasswordAndTypeChannel(
        channelRoom,
        ownerId,
        paydload.password,
        ChannelType.PROTECTED,
      );
    } else {
      return this.chatChannelService.modifyPasswordAndTypeChannel(
        channelRoom,
        ownerId,
        paydload.password,
        ChannelType.PUBLIC,
      );
    }
  }

  @Get(':password/:roomName/isPasswordCorrect') // Define the route for the parameters userId1 and userId2
  @ApiParam({ name: 'password' })
  @ApiParam({ name: 'roomName' })
  @ApiOperation({
    summary: swaggerConstants.chat.isPasswordCorrect.summary,
  })
  @ApiOkResponse({
    description: swaggerConstants.chat.isPasswordCorrect.ok.description,
  })
  async getisPasswordCorrect(
    @Param('password') password: string,
    @Param('roomName') roomName: string
  ): Promise<boolean> {
    if (await this.chatChannelService.isPasswordCorrect(roomName,password))
    return;
  else
    throw new BadRequestException('Invalid password');
  }

  @Patch(':userAddIntra/:roomName/:b_bool/setUserToPrivateChannel') // Define la ruta para los parámetros userId1 y userId2
  @ApiParam({ name: 'userAddIntra' })
  @ApiParam({ name: 'roomName' })
  @ApiParam({ name: 'b_bool' })
  @ApiBody({
    description: 'JSON body with the ownerIntra',
    type: RoomOwnerIntraDTO,
  })
  @ApiOperation({
    summary: swaggerConstants.chat.setUsertoPrivateChannel.summary,
  })
  async patchaddUserToPrivateChannel(
    @Param('userAddIntra') userAddIntra: string,
    @Param('roomName') roomName: string,
    @Param('b_bool') b_bool: number,
    @Body() paydload: RoomOwnerIntraDTO,
  ): Promise<void> {
    try {
      const userAddId = await this.chatDMService.findUserIdByIntraId(
        parseInt(userAddIntra, 10),
      );
      const ownerId = await this.chatDMService.findUserIdByIntraId(
        paydload.ownerIntra,
      );
      await this.chatChannelService.addUserToPrivateChannel(
        userAddId,
        ownerId,
        roomName,
        b_bool,
      );
    } catch (error) {
      console.error('Error:', error);
    }
  }
}
