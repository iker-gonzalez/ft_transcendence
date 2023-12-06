// chat.gateway.js
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatDMService } from './service/chatDM.service';
import { ChatChannelService } from './service/chatChannel.service';
import { UserService } from '../user/user.service';
import { Socket } from 'socket.io';
import { BadGatewayException } from '@nestjs/common';
// Create a Map to store user sockets
const userSockets = new Map();

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

  async handleConnection(client: Socket, data: string): Promise<void> {}

  async handleDisconnect(client: any): Promise<void> {}

  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(client, payload) {
    console.log('receiverId:');
    console.log(payload.receiverId);
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
    console.log('joiRoom event');
    console.log(payload.roomName);
    console.log(payload.intraId);
    console.log('type:', payload.type);
    try {
      const userId = await this.chatDMservice.findUserIdByIntraId(
        payload.intraId,
      );
      console.log(userId);
      const channelExist = await this.chatChannelservice.channelExist(
        payload.roomName,
      );
      if (!channelExist) 
      {
        await this.chatChannelservice.createChannel(
          userId,
          payload.roomName,
          payload.type,
          payload.password,
        );
      }
      else {
        if (payload.type == 'PROTECTED')
        {

          if (!this.chatChannelservice.isPasswordCorrect(
            payload.roomName,
            payload.password,
            ))
            {
              //! Mirar esto
              // client.emit('joinedRoom', `Incorrect password ${payload.roomName}`);
              // return;
             throw new BadGatewayException('Cannot access to a private channel');
            }
          }
        if (payload.type == 'PRIVATE')
          throw new BadGatewayException('Cannot access to a private channel');
      }
      await this.chatChannelservice.addUserToChannel(userId, payload.roomName);

      client.join(payload.roomName);
      client.emit('joinedRoom', `Te has unido a la sala ${payload.roomName}`);
    } catch (error) {
      console.error('Error:', error);
    }

    // Obtener la lista de clientes en la sala
    // const io = this.server;
    // const room = io.of('/').in(roomName) as any; // Afirmación de tipo
    // room.clients((error, clients) => {
    //   if (!error) {
    //     console.log(`Clientes en la sala ${roomName}:`, clients);
    //   }
    // });
  }

  @SubscribeMessage('sendMessageToRoom')
  async handleSendMessageToRoom(client: Socket, payload) {
    console.log('sendMessageToRoom event');
    console.log('all payload:', payload);
    console.log('roomName:', payload.roomName);
    console.log('intraId:', payload.intraId);

    // id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    // senderName: userData?.username || 'Anonymous',
    // senderAvatar: userData?.avatar || 'Anonymous',
    // content: newMessage,
    // timestamp: new Date().toString(),

    try {
      // Actualizar la DB
      const userId = await this.chatDMservice.findUserIdByIntraId(
        payload.intraId,
      );
      console.log("userId");
      console.log(userId);
      console.log(payload.roomName);
      await this.chatChannelservice.addChannelMessageToUser(
        payload.roomName,
        userId,
        payload.content,
      );

      // Enviar el mensaje a todos los clientes en la sala
      //this.server.to(payload.roomName).emit('message', payload);

      
    const chatRoom= await this.chatChannelservice. getUsersFromChatRoom(payload.roomName);
    console.log("jhkjhkjh");

    for (const usuario of chatRoom) {

      // Enviar mensage a todos los usuarios del grupo
      const userIntra = await this.chatDMservice.findUserIntraById(usuario.userId);
      this.server.emit(`groupMessage/${userIntra}`,
      JSON.stringify(payload))

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
    console.log('----kickUser event-----');
    console.log('payload:', payload);
    try {
      const userId = await this.chatDMservice.findUserIdByIntraId(
        payload.intraId,
      );
      const addminId = await this.chatDMservice.findUserIdByIntraId(
        payload.adminId,
      );
      await this.chatChannelservice.kickUserInChannel(
        payload.roomName,
        addminId,
        userId,
      );
      client.leave(payload.roomName);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  @SubscribeMessage('banUser')
  async handleBanUser(client: Socket, payload) {
    try {
      const userId = await this.chatDMservice.findUserIdByIntraId(
        payload.intraId,
      );
      const addminId = await this.chatDMservice.findUserIdByIntraId(
        payload.adminId,
      );
      await this.chatChannelservice.banUserInChannel(
        payload.roomName,
        addminId,
        userId,
      );
      client.leave(payload.roomName);
    } catch (error) {
      console.error('Error:', error);
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
