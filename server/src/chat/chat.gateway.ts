// chat.gateway.js
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatDMService } from './service/chatDM.service';
import { ChatChannelService } from './service/chatChannel.service';
import { UserService } from '../user/user.service';
import { Socket } from 'socket.io';
import { BadGatewayException } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection {
  constructor(
    private readonly chatDMservice: ChatDMService,
    private readonly chatChannelservice: ChatChannelService,
    private readonly userService: UserService,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(client, payload) {
    try {
      // Prueba para el get de lo DM
      const senderId = await this.chatDMservice.findUserIdByIntraId(
        payload.senderIntraId,
      );
      const receiverId = await this.chatDMservice.findUserIdByIntraId(
        payload.receiverIntraId,
      );

      const addMessageStatus = await this.chatDMservice.addMessageToUser(
        senderId,
        receiverId,
        payload.content,
      );

      // Emit signal to update the receiver chat frontend
    } catch (error) {
      console.error('Error:', error);
    }
    // Emit signal to update the receiver chat frontend
    this.server.emit(
      `privateMessageReceived/${payload.receiverIntraId}`,
      JSON.stringify(payload),
    );
  }

  /*
@SubscribeMessage('muteUserDM')
async handleMuteUserDM(client, payload) {
  try { 
    // Prueba para el get de lo DM
    const senderId = await this.chatDMservice.findUserIdByIntraId(payload.senderId);
    const receiverId = await this.chatDMservice.findUserIdByIntraId(payload.receiverId);

    const addMessageStatus =  await this.chatDMservice.unblockUserDM(senderId, receiverId);
    this.server.emit(`muteUserDMDone/${payload.receiverId}`,
    JSON.stringify(payload))
  } catch (error) {
    console.error("Error:", error);
  }
}

@SubscribeMessage('unmuteUserDM') 
async handleUnmuteUserDM(client, payload) {
  try { 
    // Prueba para el get de lo DM
    const senderId = await this.chatDMservice.findUserIdByIntraId(payload.senderId);
    const receiverId = await this.chatDMservice.findUserIdByIntraId(payload.receiverId);
    const addMessageStatus =  await this.chatDMservice.unblockUserDM(senderId, receiverId);
    this.server.emit(`unmuteUserDMDone/${payload.receiverId}`,
    JSON.stringify(payload))
  } catch (error) {
    console.error("Error:", error);
  }
}*/

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, payload) {
    // Unir al cliente a la sala
    try {
      const userId = await this.chatDMservice.findUserIdByIntraId(
        payload.intraId,
      );
      const channelExist = await this.chatChannelservice.channelExist(
        payload.roomName,
      );
      if (!channelExist) {
        await this.chatChannelservice.createChannel(
          userId,
          payload.roomName,
          payload.type,
          payload.password,
        );
      } else {
        if (payload.type == 'PROTECTED') {
          if (
            !(await this.chatChannelservice.isPasswordCorrect(
              payload.roomName,
              payload.password,
            ))
          ) {
            //! Mirar esto
            // client.emit('joinedRoom', `Incorrect password ${payload.roomName}`);
            // return;
            throw new BadGatewayException('Cannot access to a private channel');
          }
        }
        if (payload.type == 'PRIVATE')
          throw new BadGatewayException('Cannot access to a private channel');
      }

      // Cuando se crear el grupo ya se crea un grupo ya se le añade al channel como usuario
      if (channelExist) {
        await this.chatChannelservice.addUserToChannel(
          userId,
          payload.roomName,
        );
      }

      client.join(payload.roomName);
      client.emit('joinedRoom', `Te has unido a la sala ${payload.roomName}`);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  @SubscribeMessage('sendMessageToRoom')
  async handleSendMessageToRoom(client: Socket, payload) {
    try {
      // Actualizar la DB
      const userId = await this.chatDMservice.findUserIdByIntraId(
        payload.senderIntraId,
      );
      await this.chatChannelservice.addChannelMessageToUser(
        payload.roomName,
        userId,
        payload.content,
      );

      const chatRoom = await this.chatChannelservice.getUsersFromChatRoom(
        payload.roomName,
      );

      for (const usuario of chatRoom) {
        // Enviar mensage a todos los usuarios del grupo
        const userIntra = await this.chatDMservice.findUserIntraById(
          usuario.userId,
        );
        if (userIntra != payload.senderIntraId) {
          this.server.emit(
            `groupMessage/${userIntra}`,
            JSON.stringify(payload),
          );
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(client: Socket, payload) {
    try {
      const userId = await this.chatDMservice.findUserIdByIntraId(
        payload.intraId,
      );
      await this.chatChannelservice.leaveUserFromChannel(
        payload.roomName,
        userId,
      );
      client.leave(payload.roomName);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  @SubscribeMessage('kickUser')
  async handleKickUser(client: Socket, payload) {
    const userId = await this.chatDMservice.findUserIdByIntraId(
      payload.intraId,
    );
    const addminId = await this.chatDMservice.findUserIdByIntraId(
      payload.adminId,
    );

    if (!userId || !addminId) {
      return {
        success: false,
      };
    }

    await this.chatChannelservice.kickUserInChannel(
      payload.roomName,
      addminId,
      userId,
    );
    client.leave(payload.roomName);

    return {
      success: true,
    };
  }

  @SubscribeMessage('banUser')
  async handleBanUser(client: Socket, payload) {
    const userId = await this.chatDMservice.findUserIdByIntraId(
      payload.intraId,
    );
    const addminId = await this.chatDMservice.findUserIdByIntraId(
      payload.adminId,
    );

    if (!userId || !addminId) {
      return {
        success: false,
      };
    }

    try {
      await this.chatChannelservice.banUserInChannel(
        payload.roomName,
        addminId,
        userId,
      );
      client.leave(payload.roomName);
      return {
        success: true,
      };
    } catch (e) {
      return {
        success: false,
      };
    }
  }

  @SubscribeMessage('UnBanUser')
  async handleUnBanUser(client: Socket, payload) {
    try {
      const userId = await this.chatDMservice.findUserIdByIntraId(
        payload.intraId,
      );
      const addminId = await this.chatDMservice.findUserIdByIntraId(
        payload.addAdminId,
      );
      await this.chatChannelservice.unbanUserInChannel(
        payload.roomName,
        addminId,
        userId,
      );
    } catch (error) {
      console.error('Error:', error);
    }
  }
  @SubscribeMessage('joinProtectedGroup')
  async handleJoinProtectedGroup(client: Socket, payload) {
    try {
      const userId = await this.chatDMservice.findUserIdByIntraId(
        payload.intraId,
      );
      await this.chatChannelservice.isPasswordCorrect(
        payload.roomName,
        payload.password,
      );
      await this.chatChannelservice.addUserToChannel(userId, payload.roomName);
      client.emit('joinedRoom', `Te has unido a la sala ${payload.roomName}`);
    } catch (error) {
      console.error('Error:', error);
    }
  }
}
