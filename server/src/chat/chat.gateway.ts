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
import { Socket } from 'socket.io';
import { BadGatewayException } from '@nestjs/common';
import { JoinRoomPayloadDto } from './dto/join-room-payload.dto';
import { validateOrReject } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection {
  constructor(
    private readonly chatDMservice: ChatDMService,
    private readonly chatChannelservice: ChatChannelService,
    private readonly prisma: PrismaService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(): Promise<void> {
    // Do not delete, required by interface
  }

  async handleDisconnect(): Promise<void> {
    // Do not delete, required by interface
  }

  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(client, payload) {
    // Prueba para el get de lo DM
    const senderId = await this.chatDMservice.findUserIdByIntraId(
      payload.senderIntraId,
    );
    const receiverId = await this.chatDMservice.findUserIdByIntraId(
      payload.receiverIntraId,
    );

    await this.chatDMservice.addMessageToUser(
      senderId,
      receiverId,
      payload.content,
    );

    this.server.emit('newData');
    // Emit signal to update the receiver chat frontend
    this.server.emit(
      `privateMessageReceived/${payload.receiverIntraId}`,
      JSON.stringify(payload),
    );
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, payload: JoinRoomPayloadDto) {
    // Unir al cliente a la sala
    try {
      const userId = await this.chatDMservice.findUserIdByIntraId(
        payload.intraId,
      );
      const channelExist = await this.chatChannelservice.channelExist(
        payload.roomName,
      );
      if (!channelExist) {
        if (payload.type == 'PROTECTED') {
          try {
            await validateOrReject(new JoinRoomPayloadDto(payload));
          } catch (e) {
            return 'PASSWORD KO';
          }
        }

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
      this.server.emit('newData');

      return 'OK';
    } catch (error) {
      return 'KO';
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
        const userInfo = await this.prisma.user.findUnique({
          where: {
            id: usuario.userId,
          },
        });
        const userBlockedList = userInfo.blockList;

        if (userBlockedList.includes(userId)) {
          continue;
        }

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
      this.server.emit('newData');
      client.leave(payload.roomName);
    } catch (error) {
      return 'KO';
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

    this.server.emit('newData');

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
      this.server.emit('newData');
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
    const userId = await this.chatDMservice.findUserIdByIntraId(
      payload.intraId,
    );
    const addminId = await this.chatDMservice.findUserIdByIntraId(
      payload.addAdminId,
    );

    if (!userId || !addminId) {
      return {
        success: false,
      };
    }

    try {
      await this.chatChannelservice.unbanUserInChannel(
        payload.roomName,
        addminId,
        userId,
      );

      this.server.emit('newData');
      return {
        success: true,
      };
    } catch (e) {
      return {
        success: false,
      };
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

  @SubscribeMessage('update')
  async handleUpdate(client: Socket) {
    this.server.emit('newData');
  }
}
