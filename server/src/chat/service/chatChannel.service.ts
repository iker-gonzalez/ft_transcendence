import { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GetDirectMessageDto } from './../dto/get-direct-message.dto';
import { AddMessageToUserDto } from './../dto/add-message.dto';
import { UserService } from '../../user/user.service';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class ChatChannelService {
  constructor(private readonly prisma: PrismaService) {
  }

  async channelExist(
    channelName: string,
  ) :  Promise<boolean> 
  {
    try
    { 
      if (!channelName)
      throw new BadRequestException('channelName cannot be null');

      const foundChatRoom = await this.prisma.chatRoom.findFirst({
        where: { name: channelName,
        },
      });
      if (!foundChatRoom)
        return false;
      else
        return true;
    }
    catch(e)
    {
      throw new BadRequestException(e);
    }
  }

  
  async createChannel(
    adminId: string,
    channelName: string,
    access: string
  ): Promise<void> 
  {
    try{
        if (!adminId)
        throw new BadRequestException('adminId does not exist in DB');

      // Crear el Channel
      await this.prisma.chatRoom.create({
          data:{
            name: channelName
          }
        })
    }
    catch(e)
    {
      throw new BadRequestException(e);
    }

   };

   async addUserToChannel(
    userIdToAdd: string,
    channelName: string,
  ): Promise<void> 
  {
    try{
        if (!userIdToAdd)
        throw new BadRequestException('adminId does not exist in DB');

      // Crear el Channel
      const foundChatRoom = await this.prisma.chatRoom.findFirst({
        where: { name: channelName,
        },
        include:{
          users:true,
        },
      });
      if (!foundChatRoom)
        throw new BadRequestException("This chatRoom does not exist");

      // Buscar si ya esta en la Sala
      const existingChatRoomUser = await this.prisma.chatRoomUser.findFirst({
        where: {
          userId: userIdToAdd,
          roomId: foundChatRoom.id,
        },
      });

      //Si ya esta en el ChatRoom no hay que añadirlo
      if (existingChatRoomUser)
        return;
        
        console.log("foundCharRoom");
        console.log(foundChatRoom.users);
        console.log(foundChatRoom.id);
        
        // Añadir el usuario a la sala de chat
        const myharRoomUser = await this.prisma.chatRoomUser.create({
          data: {
            roomId: foundChatRoom.id,
            userId: userIdToAdd,
          },
        })
     
    }
    catch(e)
    {
      throw new BadRequestException(e);
    }

   };

   
   async addChannelMessageToUser(
    channelRoom: string,
    senderId: string,
    content: string
   ): Promise<void> 
   {
    if (!channelRoom || !senderId || !content)
    throw new BadRequestException ("channelRoom or senderId or content are null");

  // Get el Channel
    const foundChatRoom = await this.prisma.chatRoom.findFirst({
      where: { name: channelRoom,
      },
      include:{
        users:true,
      },
    });

    if (!foundChatRoom)
      throw new BadRequestException ("channelRoom not exist");

    const existingMessage = await this.prisma.chatMessage.create({
      data: 
      { 
        content: content,
        roomId:foundChatRoom.id,
        senderId:senderId, 
      },
    });  
    
}
/*
async leaveUserFromChannel(
  channelRoom: string,
  userToLeaveId: string,
 ): Promise<void> 
 {
  if (!channelRoom || !userToLeaveId )
  throw new BadRequestException ("channelRoom or userToLeaveId or content are null");

  // Get el Channel
  const foundChatRoom = await this.prisma.chatRoom.findFirst({
    where: { name: channelRoom,
    },
    include:{
      users:true,
    },
  });

  if (!foundChatRoom)
  throw new BadRequestException ("channelRoom not exist");

 // Buscar si ya esta en la Sala
 const existingChatRoomUser = await this.prisma.chatRoomUser.findFirst({
  where: {
    userId: userToLeaveId,
    roomId: foundChatRoom.id,
  },
  });
   
  if (existingChatRoomUser)
  {
    await this.prisma.chatRoomUser.delete({
      where: {
        userId: userToLeaveId,
        roomId: foundChatRoom.id,
      },
    });
  }
 }*/
}

