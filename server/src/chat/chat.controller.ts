import {
  Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
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
import { swaggerConstants } from 'config/swagger.constants';
import { ChatChannelService } from './service/chatChannel.service';
import { AllUsersDMWithDTO } from './dto/all-users-DM-with.dto';
import { ConversationMessageDTO } from './dto/conversation-message.dto';
import { AllExistingChannelsDTO } from './dto/all-existing-channel.dto';
import { AllUserChannelInDTO } from './dto/all-user-channel-in.dto';
import { ChannelType } from '@prisma/client';
import { AllChannelInfo } from './dto/all-channel-info.dto';
import { RoomOwnerIntraDTO } from './dto/roomOwnerIntra.dto';


interface Payload {
  ownerID: string;
}

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
    constructor(
      private readonly chatDMService: ChatDMService,
      private readonly chatChannelService: ChatChannelService
      ) 
    {    }
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
      @Param('userId2') userIntraId2: string
    ) : Promise<ConversationMessageDTO[]> {  
      console.log("getDMBetweenUsers get");
      try{
        const userId1 = await this.chatDMService.findUserIdByIntraId(parseInt(userIntraId1, 10));
        const userId2 = await this.chatDMService.findUserIdByIntraId(parseInt(userIntraId2, 10));
        return this.chatDMService.getDMBetweenUsers(userId1, userId2);
      }
      catch (error) { 
          console.error("Error:", error); 
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
    async getAllUserDMWith(
      @Param('userId') userIntraId: string
      ):Promise<any[]> {
      const userId = await this.chatDMService.findUserIdByIntraId(parseInt(userIntraId, 10));

      console.log("getAllUserDMWith get");
      console.log(userId);
        try{
        return this.chatDMService.getAllUserDMWith(userId);
      } 
        catch (error) {
            console.error("Error:", error);
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
      ):Promise<void> {
        
        console.log("patchBlockUser patch");
        try{
          const userId = await this.chatDMService.findUserIdByIntraId(parseInt(userIntra, 10));
          const ToBlockId = await this.chatDMService.findUserIdByIntraId(parseInt(ToBlockIntra, 10));
          if (b_block == 1)
          {
            console.log("blocked patch");
            console.log(b_block);

            this.chatDMService.blockUserDM(userId, ToBlockId);
          }
          else
            this.chatDMService.unblockUserDM(userId, ToBlockId);

      } 
        catch (error) {
            console.error("Error:", error);
        }
    }

    /*
    @Post(':userIntra/:unblockUserIntra/unblockUser') 
    @ApiParam({ name: 'userIntra' }) 
    @ApiParam({ name: 'unblockUserIntra' }) 
    @ApiOperation({
      summary: swaggerConstants.chat.unblock.summary,
    })
    async getUnBlockUser(
      @Param('userIntra') userIntra: string,
      @Param('unblockUserIntra') unblockUserIntra: string,
      ):Promise<void> {
        
        console.log("getUnBlockUser get");
        console.log(userIntra);
        try{
          const userId = await this.chatDMService.findUserIdByIntraId(parseInt(userIntra, 10));
          const ToBlockId = await this.chatDMService.findUserIdByIntraId(parseInt(unblockUserIntra, 10));
          this.chatDMService.unblockUserDM(userId, ToBlockId);
      } 
        catch (error) {
            console.error("Error:", error);
        }
    }
*/

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
    async getAllExistingChannels(

      ):Promise<any[]> {

      console.log("getAllExistingChannels get");

      try{
        return this.chatChannelService.getAllExistingChannels();
      }
      catch (error) {
          console.error("Error:", error);
      }
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
      @Param('userIntra') userIntraId: string
      ):Promise<any[]> {

      console.log("getAllUserChannelIn get");
      console.log(userIntraId);
      
      try{
        const userId = await this.chatDMService.findUserIdByIntraId(parseInt(userIntraId, 10));
        return this.chatChannelService.getAllUserChannelIn(userId);
      }
      catch (error) {
          console.error("Error:", error);
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
    ) : Promise<ConversationMessageDTO[]> { 
      console.log("getMessageInRoom get");
      try{
        return this.chatChannelService.getMessageInRoom(roomName);
      }
      catch (error) {
          console.error("Error:", error);
      }
    } 

  /********************************************************** */
  //                     ADMIN FUNCIONALITY                   //
  /********************************************************** */ 


    @Post(':channelRoom/:ownerIntra/:deleteAdminIntra/deleteAdmin') 
    @ApiParam({ name: 'channelRoom' }) 
    @ApiParam({ name: 'ownerIntra' }) 
    @ApiParam({ name: 'deleteAdminIntra' })
    @ApiOperation({
      summary: swaggerConstants.chat.deleteAdmin.summary,
    })
    async getdeleteAddminToChannel( 
      @Param('channelRoom') channelRoom: string,
      @Param('ownerIntra') ownerIntra: string,
      @Param('deleteAdminIntra') deleteAdminIntra: string,
    ) : Promise<void> { 
      console.log("deleteAddminToChannel get");
      console.log(channelRoom);
      console.log(ownerIntra);
      console.log(deleteAdminIntra);
      try{
        const ownerId = await this.chatDMService.findUserIdByIntraId(parseInt(ownerIntra, 10));
        const deleteAdminId = await this.chatDMService.findUserIdByIntraId(parseInt(deleteAdminIntra, 10));
        this.chatChannelService.deleteAddminToChannel(channelRoom, ownerId, deleteAdminId);
      }
      catch (error) {
          console.error("Error:", error);
      }
    }

    @Post(':channelRoom/:ownerIntra/:newAdminIntra/addAdmin') 
    @ApiParam({ name: 'channelRoom' }) 
    @ApiParam({ name: 'ownerIntra' }) 
    @ApiParam({ name: 'newAdminIntra' })
    @ApiOperation({
      summary: swaggerConstants.chat.addAdmin.summary,
    })
    async getAddAddminToChannel( 
      @Param('channelRoom') channelRoom: string,
      @Param('ownerIntra') ownerIntra: string,
      @Param('newAdminIntra') newAdminIntra: string,
    ) : Promise<void> { 
      console.log("getAddAddminToChannel get");
      console.log(channelRoom);
      console.log(ownerIntra);
      console.log(newAdminIntra);
      try{ 
        const ownerId = await this.chatDMService.findUserIdByIntraId(parseInt(ownerIntra, 10));
        const newAdminId = await this.chatDMService.findUserIdByIntraId(parseInt(newAdminIntra, 10));
        this.chatChannelService.addAddminToChannel(channelRoom, ownerId, newAdminId);
      }
      catch (error) {
          console.error("Error:", error);
      }
    }


    @Patch(':channelRoom/:userToMuteIntra/:b_mute/setMute') 
    @ApiParam({ name: 'channelRoom' }) 
    @ApiParam({ name: 'userToMuteIntra' })
    @ApiParam({ name: 'b_mute' }) 
    @ApiBody({ description: 'JSON body with the ownerIntra', type: RoomOwnerIntraDTO })
    @ApiOperation({
      summary: swaggerConstants.chat.muteUser.summary,
    })
    async patchMuteUserToChannel( 
      @Param('channelRoom') channelRoom: string,
      @Param('userToMuteIntra') userToMuteIntra: string,
      @Param('b_mute') b_mute: number,
      @Body() paydload: RoomOwnerIntraDTO,
    ) : Promise<void> { 
      console.log("patchMuteUserToChannel patch");
      console.log(channelRoom);
      console.log(userToMuteIntra);
      console.log(paydload);
      console.log(paydload.ownerIntra);
      try{ 
        const ownerId = await this.chatDMService.findUserIdByIntraId(paydload.ownerIntra);
      const userToMuteId = await this.chatDMService.findUserIdByIntraId(parseInt(userToMuteIntra, 10));
        if (b_mute == 1)
        {
          this.chatChannelService.muteUserInChannel(channelRoom, ownerId, userToMuteId);
        }
        else
        {
          this.chatChannelService.unmuteUserInChannel(channelRoom, ownerId, userToMuteId);
        }
      }
      catch (error) {
          console.error("Error:", error);
      }
    }

    @Post(':channelRoom/:ownerIntra/:userToUnMuteIntra/unmuteUser') 
    @ApiParam({ name: 'channelRoom' }) 
    @ApiParam({ name: 'ownerIntra' }) 
    @ApiParam({ name: 'userToUnMuteIntra' })
    @ApiOperation({
      summary: swaggerConstants.chat.unmuteUser.summary,
    })
    async getUnMuteUserToChannel( 
      @Param('channelRoom') channelRoom: string,
      @Param('ownerIntra') ownerIntra: string,
      @Param('userToUnMuteIntra') userToUnMuteIntra: string,
    ) : Promise<void> { 
      console.log("getMuteUserToChannel get");
      console.log(channelRoom);
      console.log(ownerIntra);
      console.log(userToUnMuteIntra);
      try{ 
        const ownerId = await this.chatDMService.findUserIdByIntraId(parseInt(ownerIntra, 10));
        const userToUnMuteId = await this.chatDMService.findUserIdByIntraId(parseInt(userToUnMuteIntra, 10));
        this.chatChannelService.unmuteUserInChannel(channelRoom, ownerId, userToUnMuteId);
      }
      catch (error) {
          console.error("Error:", error);
      }
    }

    @Post(':channelRoom/:ownerIntra/:password/addPassword')
    @ApiParam({ name: 'channelRoom' }) 
    @ApiParam({ name: 'ownerIntra' }) 
    @ApiParam({ name: 'password' }) 
    @ApiOperation({
      summary: swaggerConstants.chat.addOrModifyPassword.summary,
    })
    async postaddPasswordChannel( 
      @Param('channelRoom') channelRoom: string,
      @Param('ownerIntra') ownerIntra: string,
      @Param('password') password: string,
    ) : Promise<void> { 
      console.log("postaddPasswordChannel post");
      try{
        const ownerId = await this.chatDMService.findUserIdByIntraId(parseInt(ownerIntra, 10));
        this.chatChannelService.modifyPasswordAndTypeChannel(channelRoom, ownerId, password, ChannelType.PROTECTED);
      }
      catch (error) {
          console.error("Error:", error);
      }
    }

    @Post(':channelRoom/:ownerIntra/:password/deletePassword')
    @ApiParam({ name: 'channelRoom' }) 
    @ApiParam({ name: 'ownerIntra' }) 
    @ApiParam({ name: 'password' })
    @ApiOperation({
      summary: swaggerConstants.chat.deletePassword.summary,
    })
    async postdeletePasswordChannel( 
      @Param('channelRoom') channelRoom: string,
      @Param('ownerIntra') ownerIntra: string,
    ) : Promise<void> { 
      console.log("postaddPasswordChannel post");
      try{
        const ownerId = await this.chatDMService.findUserIdByIntraId(parseInt(ownerIntra, 10));
        this.chatChannelService.modifyPasswordAndTypeChannel(channelRoom, ownerId, null, ChannelType.PUBLIC);
      }
      catch (error) {
          console.error("Error:", error);
      }
    }



}