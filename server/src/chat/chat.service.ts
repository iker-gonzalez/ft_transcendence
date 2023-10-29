import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetDirectMessageDto } from './dto/get-direct-message.dto';
import { AddMessageToUserDto } from './dto/add-message.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}
  
  // Sens DM between two user, sorted by time created.
  async getDMBetweenUsers(userId1: string, userId2: string):
    Promise<any[]>
  {
    const conversationMessages = await this.prisma.directMessage.findMany({
      where: {
        OR: [
          {
            senderId: userId1,
            receiverId: userId2,
          },
          {
            senderId: userId2,
            receiverId: userId1,
          },
        ],
      },
      orderBy: {
        createdAt: 'asc', // Ordenar por fecha de creación de forma ascendente
      },
    });
    return conversationMessages;
  }

    // Sens DM between two user, sorted by time created.
    async getAllUserDMWith(userId: string):
    Promise<any[]>
  {
    const usersWithConversations = await this.prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      distinct: ['senderId', 'receiverId'], // Selecciona valores únicos de senderId y receiverId
      select: {
        senderId: true,
        receiverId: true,
      },
    });
    
    // Combina los valores de senderId y receiverId en una sola lista
    const allUsers = [
      ...usersWithConversations.map((message) => message.senderId),
      ...usersWithConversations.map((message) => message.receiverId),
    ];
    
    // Elimina duplicados y el propio usuario actual
    const uniqueUsers = Array.from(new Set(allUsers)).filter((user) => user !== userId);
    
    return uniqueUsers;
  }


  async getMessagesByUser(
    intraId: string,
    ): Promise<any[]> 
  {
    const userWithMessage = await this.prisma.user.findUnique({
      where: { intraId: parseInt(intraId, 10)},
      include: {
       sentMessages: true,
       receivedMessages: true,
      },
    });

    if (!userWithMessage) {
      throw new BadRequestException('User with ID ${id} not found');
    }

    const sentMessages = userWithMessage.sentMessages || [];
    const receivedMessages = userWithMessage.receivedMessages || [];

    // Join sended and received messages.
    const allMessages = [...sentMessages, ...receivedMessages];

    return allMessages;
  }

  async findUserIdByIntraId(intraId: number): Promise<string>
  {
    const user = await this.prisma.user.findUnique({
      where: {
        intraId: intraId,
      },
    });

    return user ? user.id : null;
  }


  async addMessageToUser(
    userSenderId: string,
    userReceiverId: string,
    content: string
  ): Promise<void> 
  {
 //   const idSender = this.findUserIdByIntraId(parseInt(senderIntraId, 10));
 //   const idReceiver = this.findUserIdByIntraId(parseInt(receiverIntraId, 10));
    try {
 //    const userSenderId = await idSender;
 //    console.log("userSenderId");
 //    console.log(userSenderId);

 //    const userReceiverId = await idReceiver;
 //    console.log("userReceiverId");
 //    console.log(userReceiverId);
 //
      const existingMessage = await this.prisma.directMessage.findUnique({
        where: { id: userSenderId },
      });  
      
      if (!existingMessage || existingMessage) {

        console.log("exisingMessage");
        // El registro no se encontró, así que créalo
        const newMessage = await this.prisma.directMessage.create({
          data: {
            senderId: userSenderId,
            receiverId: userReceiverId,
            content: content,
          },
        });
      }
  }
    catch(e)
    {
      throw new BadRequestException(e);
    }

   };
  }






