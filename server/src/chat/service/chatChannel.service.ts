import { ChatRoom, ChatRoomUser, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GetDirectMessageDto } from './../dto/get-direct-message.dto';
import { AllExistingChannelsDTO } from './../dto/all-existing-channel.dto';
import { AllUserChannelInDTO } from './../dto/all-user-channel-in.dto';
import { AddMessageToUserDto } from './../dto/add-message.dto';
import { UserService } from '../../user/user.service';

import { BadRequestException, Injectable } from '@nestjs/common';
import { ConversationMessageDTO } from '../dto/conversation-message.dto';

@Injectable()
export class ChatChannelService {
  constructor(private readonly prisma: PrismaService) {
  }
  /********************************************************** */
  //                     END POINT GETTER                     //
  /********************************************************** */
    // Get all the DM conversation the user had had with other users
    async getAllUserChannelIn(userId: string):
    Promise<AllUserChannelInDTO[]>
  {
    if (userId == null)
      throw new BadRequestException('User Id not found in DB');

      const userChatRooms = await this.prisma.chatRoomUser.findMany({
        where: {
          userId: userId, // El ID del usuario del que deseas encontrar los ChatRooms
        },
        select: {
          room: {
            select: {
              name: true,
              // Otros campos de ChatRoom que desees incluir
            },
          },
        },
      });
  
      if (userChatRooms) {
        const chatRooms = userChatRooms.map((entry) => entry.room);
        return chatRooms;
      }

      return [];
  }

  async getMessageInRoom(roomName: string):
  Promise<any[]>
  {
    if (roomName == null)
      throw new BadRequestException('User Id not found in DB');
  
      const chatRoom = await this.prisma.chatRoom.findFirst({
        where: {
          name: roomName,
        },
      });
      if (!chatRoom)
       {
        // La sala de chat con el nombre especificado no fue encontrada
        throw new BadRequestException('roomName not found in DB');
      }
    
      const conversationsChannel = await this.prisma.chatMessage.findMany({
        where: {
          roomId: chatRoom.id,
        },
        select: {
          content: true,
          createdAt: true,
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
              connectStatus: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      
      // El objeto `conversations` contendrá todas las conversaciones relacionadas con el canal, incluyendo el contenido de los mensajes
      const conversationDTO = [];
      for (const message of conversationsChannel )
      {
          conversationDTO.push(new ConversationMessageDTO(message, message.sender, null));
  
      }
    return conversationDTO;
  }


  async getAllExistingChannels(
  ) :  Promise< AllExistingChannelsDTO[] > 
  {
    const allExistingChannels = await this.prisma.chatRoom.findMany({
      select: {
        name: true,
        type: true, // Asegúrate de tener el campo "type" en tu modelo de ChatRoom
      },
    });

    const allExistingChannelsDTO = [];
    for (const channel of allExistingChannels )
    {
      const existingChannelsDTO = new  AllExistingChannelsDTO();
      existingChannelsDTO.name = channel.name;
      existingChannelsDTO.type = channel.type;
      allExistingChannelsDTO.push(existingChannelsDTO);

    }
    return allExistingChannelsDTO;
  }


  /********************************************************** */
  //                     CHANEL FUNCIONALITY                  //
  /********************************************************** */
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
            name: channelName,
            ownerId: adminId
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

    // Buscar si ya esta en la Sala
    const existingChatRoomUser = await this.prisma.chatRoomUser.findFirst({
    where: {
      userId: senderId,
      roomId: foundChatRoom.id,
    },
    });

    if (!existingChatRoomUser)
      throw new BadRequestException ("user is not in the channel");

    const existingMessage = await this.prisma.chatMessage.create({
      data: 
      { 
        content: content,
        roomId:foundChatRoom.id,
        senderId:senderId, 
      },
    });  
    
}

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
        id: existingChatRoomUser.id,
      },
    });
  }
 }

  /********************************************************** */
  //                     ADMIN FUNCIONALITY                   //
  /********************************************************** */
  async addAddminToCahnner(
    channelRoom: string,
    ownerId: string,
    newAdminId: string
   ): Promise<void> 
{
 
  if (!channelRoom || !ownerId || !newAdminId)
  throw new BadRequestException ("channelRoom or ownerId or newAdminId  are null");

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

  if (ownerId != foundChatRoom.ownerId)
  throw new BadRequestException ("It is not the owner of the channel, not premissions to do this");

  try{

    // Agregar el usuario como administrador de la sala de chat
    const updatedChatRoom = await this.prisma.chatRoom.update({
      where: { id: foundChatRoom.id },
      data: {
        adminUsers: {
          connect: {
            id: newAdminId,
          },
        },
      },
    });
  }
  catch(error){
    console.error("Error:", error);
  }

}


  /********************************************************** */
  //                     ACCESS FUNCIONALITY                  //
  /********************************************************** */
}

