import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetDirectMessageDto } from './dto/get-direct-message.dto';

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
    const userWithFriends = await this.prisma.user.findUnique({
      where: {
        intraId: intraId,
      //  intraId: intraId ? intraId : user.intraId,
      },
      include: {
       sentMessages: true,
       receivedMessages: true,
      },
    });

    if (!userWithFriends) {
      throw new BadRequestException('User not found');
    }

    return {
      found: userWithFriends.sentMessages.length + userWithFriends.receivedMessages.length,
      data: {
        id: userWithFriends.id,
        intraId: userWithFriends.intraId,
        sendMessages: userWithFriends.sentMessages,
        receivedMessages: userWithFriends.receivedMessages,
      },
    };
  }
}





