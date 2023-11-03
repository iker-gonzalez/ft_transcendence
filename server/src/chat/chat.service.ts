import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetDirectMessageDto } from './dto/get-direct-message.dto';
import { AddMessageToUserDto } from './dto/add-message.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}
  
  async getUser(clientId: string) 
  {
    let userData: User; 
    try {
      userData = await this.prisma.user.findUniqueOrThrow({
        where: { id: clientId },
        include : { sentMessages : true},
      });  }
      catch (error) {
           console.log( "erorr");
           return;
        };
      return {
        created: 1, 
        data : {
          id: userData.id,
        }
      }  
  }

  async getMessagesByUser(
    intraId: number,
    ): Promise<GetDirectMessageDto> 
  {
    const userWithMessage = await this.prisma.user.findUnique({
      where: {
        intraId: intraId,
      //  intraId: intraId ? intraId : user.intraId,
      },
      include: {
       sentMessages: true,
       receivedMessages: true,
      },
    });

    if (!userWithMessage) {
      throw new BadRequestException('User not found');
    }

    return {
      found: userWithMessage.sentMessages.length + userWithMessage.receivedMessages.length,
      data: {
        id: userWithMessage.id,
        intraId: userWithMessage.intraId,
        sendMessages: userWithMessage.sentMessages,
        receivedMessages: userWithMessage.receivedMessages,
      },
    };

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
    intraId: number,
    senderId: string,
    receiverId: string,
    content: string
  ): Promise<void> 
  {
    const idSender = this.findUserIdByIntraId(intraId);
    const  receiverId2 = parseInt(receiverId, 10); 
    const idReceiver = this.findUserIdByIntraId(receiverId2);
    try {
      const userSenderId = await idSender;
      console.log("userSenderId");
      console.log(userSenderId);

      const userReceiverId = await idReceiver;
      console.log("userReceiverId");
      console.log(userReceiverId);
 
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
        // El nuevo mensaje ha sido creado
      } else {
        //por aqui no esntra, lo tengo para un futuro si es necesario
        // El registro ya existe, simplemente actualízalo
        const updatedMessage = await this.prisma.directMessage.update({
          where: { id: userSenderId},
          data: {
            senderId: userSenderId,
            receiverId: userReceiverId,
            content: content,
          },
        });
        // El mensaje existente ha sido actualizado
      }
  }
    catch(e)
    {
      throw new BadRequestException(e);
    }

   };
  }






