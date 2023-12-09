import { ChannelType, ChatRoomUser, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AllExistingChannelsDTO } from './../dto/all-existing-channel.dto';
import { AllUserChannelInDTO } from './../dto/all-user-channel-in.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConversationMessageDTO } from '../dto/conversation-message.dto';
import { AllChannelInfo } from '../dto/all-channel-info.dto';
import { IntraUsernameDTO } from '../dto/intra-username.dto';
import * as bcrypt from 'bcrypt';
import { UserRommDTO } from '../dto/user-room.dto';

@Injectable()
export class ChatChannelService {
  constructor(private readonly prisma: PrismaService) {}
  /********************************************************** */
  //                     END POINT GETTER                     //
  /********************************************************** */
  // Get all the DM conversation the user had had with other users
  async getAllUserChannelIn(userId: string): Promise<AllUserChannelInDTO[]> {
    if (userId == null)
      throw new BadRequestException('User Id not found in DB');

    const userChatRooms = await this.prisma.chatRoomUser.findMany({
      where: {
        userId: userId, // El ID del usuario del que deseas encontrar los ChatRooms
      },
      select: {
        room: {
          select: {
            id: true,
            name: true,
            type: true,
            ownerId: true,
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

  async getMessageInRoom(roomName: string): Promise<any> {
    if (roomName == null)
      throw new BadRequestException('User Id not found in DB');

    // Obtener la sala de chat con todas las relaciones utilizando el ID
    const chatRoom = await this.prisma.chatRoom.findFirst({
      where: { name: roomName },
      include: {
        adminUsers: true,
        users: true,
        mutedUsers: true,
      },
    });
    if (!chatRoom) {
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
    for (const message of conversationsChannel) {
      conversationDTO.push(
        new ConversationMessageDTO(message, message.sender, null, roomName),
      );
    }

    const ownerIntra = await this.findUserIntraById(chatRoom.ownerId);

    const allinfo = new AllChannelInfo(conversationDTO, chatRoom, ownerIntra);

    allinfo.setIntrasOfMemeber(
      await this.findUserIntraAndUsernmameById(chatRoom.users),
      'users',
    );
    allinfo.setIntrasOfMemeber(
      await this.findUserIntraAndUsernmameById(chatRoom.adminUsers),
      'admin',
    );
    allinfo.setIntrasOfMemeber(
      await this.findUserIntraAndUsernmameById(chatRoom.mutedUsers),
      'muted',
    );
    //bannedList
    allinfo.setIntrasOfMemeber(
      await this.findUserIntraAndUsernmameByString(chatRoom.bannedkList),
      'banned',
    );

    return allinfo;
  }

  async findUserIntraAndUsernmameByString(
    idUsers: string[],
  ): Promise<IntraUsernameDTO[]> {
    const userInfo = [];

    for (const idUser of idUsers) {
      const user = await this.prisma.user.findUnique({
        where: {
          id: idUser,
        },
      });
      userInfo.push(new IntraUsernameDTO(user.intraId, user.username));
    }

    return userInfo;
  }

  async findUserIntraByIArrayd(chatUsers: ChatRoomUser[]): Promise<number[]> {
    const intraIds = [];
    for (const chatUser of chatUsers) {
      intraIds.push(await this.findUserIntraById(chatUser.userId));
    }

    return intraIds;
  }

  async findUserIntraAndUsernmameById(
    chatUsers: ChatRoomUser[],
  ): Promise<IntraUsernameDTO[]> {
    const userInfo = [];

    for (const chatUser of chatUsers) {
      const user = await this.prisma.user.findUnique({
        where: {
          id: chatUser.userId,
        },
      });
      userInfo.push(new IntraUsernameDTO(user.intraId, user.username));
    }

    return userInfo;
  }

  async findUserIntraById(Id: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: Id,
      },
    });

    return user ? user.intraId : 0;
  }
  async getAllExistingChannels(): Promise<AllExistingChannelsDTO[]> {
    const allExistingChannels = await this.prisma.chatRoom.findMany({
      select: {
        name: true,
        type: true, // Asegúrate de tener el campo "type" en tu modelo de ChatRoom
      },
    });

    const allExistingChannelsDTO = [];
    for (const channel of allExistingChannels) {
      const existingChannelsDTO = new AllExistingChannelsDTO();
      existingChannelsDTO.name = channel.name;
      existingChannelsDTO.type = channel.type;
      allExistingChannelsDTO.push(existingChannelsDTO);
    }

    const sortedAllExistingChannelsDTO = allExistingChannelsDTO.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    return sortedAllExistingChannelsDTO;
  }

  /********************************************************** */
  //                     CHANEL FUNCIONALITY                  //
  /********************************************************** */
  async channelExist(channelName: string): Promise<boolean> {
    try {
      if (!channelName)
        throw new BadRequestException('channelName cannot be null');

      const foundChatRoom = await this.prisma.chatRoom.findFirst({
        where: {
          name: channelName,
        },
      });
      if (!foundChatRoom) return false;
      else return true;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async createChannel(
    ownerID: string,
    channelName: string,
    access: string,
    password: string,
  ): Promise<void> {
    try {
      if (!ownerID)
        throw new BadRequestException('adminId does not exist in DB');

      if (access == 'PUBLIC') {
        // Crear el Channel
        await this.prisma.chatRoom.create({
          data: {
            name: channelName,
            ownerId: ownerID,
            type: ChannelType.PUBLIC,
          },
        });
      } else if (access == 'PROTECTED') {
        const hashedPassword = password
          ? await bcrypt.hash(password, 10)
          : null;

        await this.prisma.chatRoom.create({
          data: {
            name: channelName,
            ownerId: ownerID,
            type: ChannelType.PROTECTED,
            password: hashedPassword,
          },
        });
      } else {
        await this.prisma.chatRoom.create({
          data: {
            name: channelName,
            ownerId: ownerID,
            type: ChannelType.PRIVATE,
          },
        });
      }

      await this.addUserToChannel(ownerID, channelName);

      await this.addAddminToChannel(channelName, ownerID, ownerID);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async addUserToChannel(
    userIdToAdd: string,
    channelName: string,
  ): Promise<void> {
    try {
      if (!userIdToAdd)
        throw new BadRequestException('adminId does not exist in DB');

      // Crear el Channel
      const foundChatRoom = await this.prisma.chatRoom.findFirst({
        where: {
          name: channelName,
        },
        include: {
          users: true,
        },
      });
      if (!foundChatRoom)
        throw new BadRequestException('This ChatRoom does not exist');

      //Buscar si esta banneado
      const isUserBanned = foundChatRoom.bannedkList.some(
        (bannedUser) => bannedUser === userIdToAdd,
      );
      if (isUserBanned)
        throw new BadRequestException('This user is banned in this ChatRoom');

      // Buscar si ya esta en la Sala
      //   const isUserAlreadyIn = foundChatRoom.users.some((user) => user.userId === userIdToAdd);
      //   if (isUserAlreadyIn)
      //       throw new BadRequestException("This user is already in this ChatRoom");
      const existingChatRoomUser = await this.prisma.chatRoomUser.findFirst({
        where: {
          userId: userIdToAdd,
          roomId: foundChatRoom.id,
        },
      });

      //Si ya esta en el ChatRoom no hay que añadirlo
      if (existingChatRoomUser) return;

      // Añadir el usuario a la sala de chat
      const myharRoomUser = await this.prisma.chatRoomUser.create({
        data: {
          roomId: foundChatRoom.id,
          userId: userIdToAdd,
        },
      });
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async addChannelMessageToUser(
    channelRoom: string,
    senderId: string,
    content: string,
  ): Promise<void> {
    if (!channelRoom || !senderId || !content)
      throw new BadRequestException(
        'channelRoom or senderId or content are null',
      );

    if (content.length > 124 || content.length < 1)
      throw new BadRequestException(
        'Message length must be between 1 and 124 characters',
      );

    // Get el Channel
    const foundChatRoom = await this.prisma.chatRoom.findFirst({
      where: {
        name: channelRoom,
      },
      include: {
        users: true,
        mutedUsers: true,
      },
    });

    if (!foundChatRoom) throw new BadRequestException('channelRoom not exist');

    const isMuted = foundChatRoom.mutedUsers.some(
      (muteUser) => muteUser.userId === senderId,
    );
    if (isMuted)
      throw new BadRequestException('User is muted, cannot send messages');

    // Buscar si ya esta en la Sala
    const existingChatRoomUser = await this.prisma.chatRoomUser.findFirst({
      where: {
        userId: senderId,
        roomId: foundChatRoom.id,
      },
    });

    if (!existingChatRoomUser)
      throw new BadRequestException('user is not in the channel');

    const existingMessage = await this.prisma.chatMessage.create({
      data: {
        content: content,
        roomId: foundChatRoom.id,
        senderId: senderId,
      },
    });
  }

  async changeChannelOwner(
    channelRoom: string,
    owenerId: string,
  ): Promise<void> {
    // Get el Channel
    const foundChatRoom = await this.prisma.chatRoom.findFirst({
      where: {
        name: channelRoom,
      },
      include: {
        users: true,
        adminUsers: true,
      },
    });

    if (!foundChatRoom || foundChatRoom.adminUsers.length < 2) {
      const foundChatRoom2 = await this.prisma.chatRoom.findFirst({
        where: {
          name: channelRoom,
        },
        include: {
          users: true,
        },
      });

      let newOwnerId = null;
      for (const user of foundChatRoom2.users) {
        if (user.userId != owenerId) {
          newOwnerId = user.userId;
          break;
        }
      }
      await this.prisma.chatRoom.update({
        where: { id: foundChatRoom2.id },
        data: {
          ownerId: newOwnerId,
        },
      });
    } else {
      let newOwnerId = null;
      for (const userAdmin of foundChatRoom.adminUsers) {
        if (userAdmin.userId != owenerId) {
          newOwnerId = userAdmin.userId;
          break;
        }
      }
      await this.prisma.chatRoom.update({
        where: { id: foundChatRoom.id },
        data: {
          ownerId: newOwnerId,
        },
      });
    }
  }

  async leaveUserFromChannel(
    channelRoom: string,
    userToLeaveId: string,
  ): Promise<void> {
    if (!channelRoom || !userToLeaveId)
      throw new BadRequestException(
        'channelRoom or userToLeaveId or content are null',
      );

    // Get el Channel
    const foundChatRoom = await this.prisma.chatRoom.findFirst({
      where: {
        name: channelRoom,
      },
      include: {
        users: true,
      },
    });

    if (!foundChatRoom) throw new BadRequestException('channelRoom not exist');

    // Buscar si ya esta en la Sala
    const existingChatRoomUser = await this.prisma.chatRoomUser.findFirst({
      where: {
        userId: userToLeaveId,
        roomId: foundChatRoom.id,
      },
    });

    if (!existingChatRoomUser)
      throw new BadRequestException('user in not in the channel');

    // Verificar si la sala de chat no tiene más usuarios
    const remainingUsers = await this.prisma.chatRoomUser.count({
      where: {
        roomId: foundChatRoom.id,
      },
    });

    // Si no hay más usuarios o el que se va es el owner(!!esto hay que debatir), eliminar la sala de chat
    if (remainingUsers === 1) {
      await this.prisma.chatRoom.delete({
        where: {
          id: foundChatRoom.id,
        },
      });
      return;
    }

    if (foundChatRoom.ownerId == userToLeaveId) {
      // Change owener id and set a admin or a user.
      this.changeChannelOwner(channelRoom, userToLeaveId);
    }

    // Delete user
    await this.prisma.chatRoomUser.delete({
      where: {
        id: existingChatRoomUser.id,
      },
    });
  }

  /********************************************************** */
  //                     ADMIN FUNCIONALITY                   //
  /********************************************************** */
  async addAddminToChannel(
    channelRoom: string,
    ownerId: string,
    newAdminId: string,
  ): Promise<void> {
    try {
      if (!channelRoom || !ownerId || !newAdminId)
        throw new BadRequestException(
          'channelRoom or ownerId or newAdminId  are null',
        );

      // Get el Channel
      const foundChatRoom = await this.prisma.chatRoom.findFirst({
        where: {
          name: channelRoom,
        },
        include: {
          users: true,
        },
      });

      if (!foundChatRoom)
        throw new BadRequestException('channelRoom not exist');

      if (ownerId != foundChatRoom.ownerId)
        throw new ConflictException(
          'It is not the owner of the channel, not premissions to do this',
        );

      // Verificar si el usuario ya pertenece a la sala de chat
      const existingUser = await this.prisma.chatRoomUser.findFirst({
        where: { roomId: foundChatRoom.id, userId: newAdminId },
      });

      // Si el usuario al que se quiere hacer administrador no es un usuario del chatRomm.
      if (!existingUser && newAdminId != foundChatRoom.ownerId) {
        throw new BadRequestException('user is not from this channel');
      }

      // Buscar el ChatRoomUser por userId
      const chatRoomUser = await this.prisma.chatRoomUser.findFirst({
        where: { userId: newAdminId },
      });

      // Actualizar el ChatRoom para agregar el nuevo usuario a la lista de adminUsers
      await this.prisma.chatRoom.update({
        where: { id: foundChatRoom.id },
        data: {
          adminUsers: {
            connect: { id: chatRoomUser.id },
          },
        },
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async deleteAddminToChannel(
    channelRoom: string,
    ownerId: string,
    deleteAdminId: string,
  ): Promise<void> {
    try {
      if (!channelRoom || !ownerId || !deleteAdminId)
        throw new BadRequestException(
          'channelRoom or ownerId or deleteAdminId  are null',
        );

      // Get el Channel
      const foundChatRoom = await this.prisma.chatRoom.findFirst({
        where: {
          name: channelRoom,
        },
        include: {
          users: true,
        },
      });

      if (!foundChatRoom)
        throw new BadRequestException('channelRoom not exist');

      if (ownerId != foundChatRoom.ownerId)
        throw new BadRequestException(
          'It is not the owner of the channel, not premissions to do this',
        );

      const isAdmin = await this.isUserAdmin(foundChatRoom.id, deleteAdminId);

      if (!isAdmin)
        throw new BadRequestException(
          'deleteAdminId is not the admin of the channel yet',
        );

      // Buscar el ChatRoomUser por userId
      const chatRoomUser = await this.prisma.chatRoomUser.findFirst({
        where: { userId: deleteAdminId },
      });

      // Actualizar la relación adminUsers del ChatRoom para desconectar al usuario administrador
      const updatedChatRoom = await this.prisma.chatRoom.update({
        where: { id: foundChatRoom.id },
        data: {
          adminUsers: {
            disconnect: { id: chatRoomUser.id },
          },
        },
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }

  private async isUserAdmin(
    chatRoomId: string,
    userId: string,
  ): Promise<boolean> {
    if (!chatRoomId || !userId)
      throw new BadRequestException('channelRoom or userId are null');

    const chatRoomUser = await this.prisma.chatRoomUser.findFirst({
      where: { userId: userId },
    });

    // Get el Channel
    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: { adminUsers: true },
    });

    const isUserAdmin = chatRoom.adminUsers.some(
      (adminUser) => adminUser.userId === userId,
    );
    return isUserAdmin;
  }

  // Mute User
  async muteUserInChannel(
    channelRoom: string,
    ownerId: string,
    muteUserId: string,
  ): Promise<void> {
    try {
      if (!channelRoom || !ownerId || !muteUserId)
        throw new BadRequestException(
          'channelRoom or ownerId or muteUserId  are null',
        );

      // Get el Channel
      const foundChatRoom = await this.prisma.chatRoom.findFirst({
        where: { name: channelRoom },
        include: {
          users: true,
        },
      });
      if (!foundChatRoom)
        throw new BadRequestException('channelRoom not exist');

      // Check permision
      const isAdmin = await this.isUserAdmin(foundChatRoom.id, ownerId);
      if (!isAdmin && ownerId != foundChatRoom.ownerId)
        throw new UnprocessableEntityException(
          'You do not have permission to mute this user.',
        );

      // Check if the banUserId is not the owner of the channel
      if (muteUserId == foundChatRoom.ownerId)
        throw new UnprocessableEntityException(
          'You cannot mute the owner of the channel.',
        );

      // Buscar el ChatRoomUser por userId
      const chatRoomUser = await this.prisma.chatRoomUser.findFirst({
        where: { userId: muteUserId },
      });
      if (!chatRoomUser)
        throw new BadRequestException('User is not in the chatRoom');

      // Actualizar la relación mutedUsers del ChatRoom para añadir al usuario muteado
      const updatedChatRoom = await this.prisma.chatRoom.update({
        where: { id: foundChatRoom.id },
        data: {
          mutedUsers: {
            connect: { id: chatRoomUser.id },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  // UnMute User
  async unmuteUserInChannel(
    channelRoom: string,
    ownerId: string,
    unmuteUserId: string,
  ): Promise<void> {
    try {
      if (!channelRoom || !ownerId || !unmuteUserId)
        throw new BadRequestException(
          'channelRoom or ownerId or unmuteUserId  are null',
        );

      // Get el Channel
      const foundChatRoom = await this.prisma.chatRoom.findFirst({
        where: { name: channelRoom },
        include: {
          users: true,
        },
      });
      if (!foundChatRoom)
        throw new BadRequestException('channelRoom not exist');

      // Check permision
      const isAdmin = await this.isUserAdmin(foundChatRoom.id, ownerId);
      if (!isAdmin && ownerId != foundChatRoom.ownerId)
        throw new BadRequestException(
          'It is not the owner or admin of the channel, not premissions to do this',
        );

      // Buscar el ChatRoomUser por userId
      const chatRoomUser = await this.prisma.chatRoomUser.findFirst({
        where: { userId: unmuteUserId },
      });
      if (!chatRoomUser)
        throw new BadRequestException('User is not in the chatRoom');

      // Actualizar la relación mutedUsers del ChatRoom para añadir al usuario muteado
      const updatedChatRoom = await this.prisma.chatRoom.update({
        where: { id: foundChatRoom.id },
        data: {
          mutedUsers: {
            disconnect: { id: chatRoomUser.id },
          },
        },
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async getMutedUsers(channelRoom: string): Promise<any> {
    const roomData = await this.prisma.chatRoom.findUnique({
      where: { id: channelRoom },
      include: { mutedUsers: true },
    });

    if (!roomData) {
      throw new BadRequestException('Channel not found');
    }

    const mutedUsers = roomData.mutedUsers.map((user) => user.userId);

    const mutedUsersIntraIds = [];
    for (const id of mutedUsers) {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: { username: true },
      });

      mutedUsersIntraIds.push({ username: user.username });
    }

    return {
      found: 1,
      data: mutedUsersIntraIds,
    };
  }

  // Kick user
  async kickUserInChannel(
    channelRoom: string,
    ownerId: string,
    kickUserId: string,
  ): Promise<void> {
    try {
      if (!channelRoom || !ownerId || !kickUserId)
        throw new BadRequestException(
          'channelRoom or ownerId or kickUserId  are null',
        );

      // Get el Channel
      const foundChatRoom = await this.prisma.chatRoom.findFirst({
        where: { name: channelRoom },
        include: {
          users: true,
        },
      });
      if (!foundChatRoom)
        throw new BadRequestException('channelRoom not exist');

      // Check permision
      const isAdmin = await this.isUserAdmin(foundChatRoom.id, ownerId);
      if (!isAdmin && ownerId != foundChatRoom.ownerId)
        throw new BadRequestException(
          'It is not the owner or admin of the channel, not premissions to do this',
        );

      // Check if the banUserId is not the owner of the channel
      if (kickUserId == foundChatRoom.ownerId)
        throw new BadRequestException(
          'Cannot KICK to the owner of the channel',
        );

      await this.leaveUserFromChannel(channelRoom, kickUserId);
    } catch (error) {
      console.error('Error:', error);
    }
  }
  // Delete admin from channel

  async banUserInChannel(
    channelRoom: string,
    ownerId: string,
    banUserId: string,
  ): Promise<void> {
    try {
      if (!channelRoom || !ownerId || !banUserId)
        throw new BadRequestException(
          'channelRoom or ownerId or muteUserId  are null',
        );

      // Get channel
      const foundChatRoom = await this.prisma.chatRoom.findFirst({
        where: { name: channelRoom },
        include: {
          users: true,
        },
      });
      if (!foundChatRoom)
        throw new BadRequestException('channelRoom not exist');

      // Check permision
      const isAdmin = await this.isUserAdmin(foundChatRoom.id, ownerId);
      if (!isAdmin && ownerId != foundChatRoom.ownerId)
        throw new BadRequestException(
          'It is not the owner or admin of the channel, not premissions to do this',
        );

      // Check if the banUserId is not the owner of the channel
      if (banUserId == foundChatRoom.ownerId)
        throw new BadRequestException('Cannot BAN to the owner of the channel');

      // Buscar el ChatRoomUser por userId
      const chatRoomUser = await this.prisma.chatRoomUser.findFirst({
        where: { userId: banUserId },
      });
      if (!chatRoomUser)
        throw new BadRequestException('User is not in the chatRoom');

      const banUserIntraId = await this.findUserIntraById(banUserId);
      const isAlreadyBanned = foundChatRoom.bannedkList.some(
        (bannedUser) => bannedUser === banUserId,
      );
      if (isAlreadyBanned)
        throw new BadRequestException('User is already banned');

      const banUserData = await this.prisma.user.findUnique({
        where: { intraId: banUserIntraId },
      });

      // Add intraId for FE consumption
      await this.prisma.chatRoomUser.update({
        where: { id: chatRoomUser.id },
        data: {
          intraId: banUserIntraId,
          username: banUserData.username,
        },
      });

      // Actualizar la relación baneUsers del ChatRoom para añadir al usuario muteado
      await this.prisma.chatRoom.update({
        where: { id: foundChatRoom.id },
        data: {
          bannedkList: {
            push: chatRoomUser.userId,
          },
        },
      });

      await this.leaveUserFromChannel(channelRoom, banUserId);
    } catch (error) {
      throw error;
    }
  }

  async unbanUserInChannel(
    channelRoom: string,
    ownerId: string,
    unbanUserId: string,
  ): Promise<void> {
    try {
      if (!channelRoom || !ownerId || !unbanUserId)
        throw new BadRequestException(
          'channelRoom or ownerId or muteUserId are null',
        );

      // Get Channel
      const foundChatRoom = await this.prisma.chatRoom.findFirst({
        where: { name: channelRoom },
        include: {
          users: true,
        },
      });
      if (!foundChatRoom)
        throw new BadRequestException('channelRoom not exist');

      // Check permision
      const isAdmin = await this.isUserAdmin(foundChatRoom.id, ownerId);
      if (!isAdmin && ownerId != foundChatRoom.ownerId)
        throw new BadRequestException(
          'It is not the owner or admin of the channel, not premissions to do this',
        );

      // Actualizar la relación mutedUsers del ChatRoom para añadir al usuario muteado
      await this.prisma.chatRoom.update({
        where: { id: foundChatRoom.id },
        data: {
          bannedkList: {
            set: foundChatRoom.bannedkList.filter(
              (bannedUser) => bannedUser !== unbanUserId,
            ),
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /********************************************************** */
  //                     PRIVACY FUNCIONALITY                 //
  /********************************************************** */

  // add password
  // change password
  // delete password
  async modifyPasswordAndTypeChannel(
    channelRoom: string,
    ownerId: string,
    password: string,
    type: ChannelType,
  ): Promise<void> {
    try {
      if (!channelRoom || !ownerId)
        throw new BadRequestException('channelRoom or ownerIntra are null');

      // Get el Channel
      const foundChatRoom = await this.prisma.chatRoom.findFirst({
        where: { name: channelRoom },
        include: {
          users: true,
        },
      });
      if (!foundChatRoom)
        throw new BadRequestException('channelRoom not exist');

      // Check permision
      if (ownerId != foundChatRoom.ownerId)
        throw new BadRequestException(
          'It is not the owner or admin of the channel, not premissions to do this',
        );

      // Buscar el ChatRoomUser por userId
      const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

      // Update the chat room
      await this.prisma.chatRoom.update({
        where: { id: foundChatRoom.id },
        data: {
          password: hashedPassword,
          type: type,
          mutedUsers: {
            set: [],
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  // check correct password
  async isPasswordCorrect(
    channelRoom: string,
    password: string,
  ): Promise<boolean> {
    try {
      if (!channelRoom) throw new BadRequestException('channelRoom are null');

      // Get el Channel
      const foundChatRoom = await this.prisma.chatRoom.findFirst({
        where: { name: channelRoom },
        include: {
          users: true,
        },
      });
      if (!foundChatRoom)
        throw new BadRequestException('channelRoom not exist');

      // Compara los hashes
      const passwordsMatch = await bcrypt.compare(
        password,
        foundChatRoom.password,
      );
      if (!passwordsMatch) return false;
    } catch (error) {
      throw new BadRequestException(error);
    }
    return true;
  }
  // make private
  async addUserToPrivateChannel(
    userIdAdd: string,
    ownerId: string,
    channelName: string,
    add: number,
  ) {
    try {
      if (!userIdAdd || !ownerId || !channelName)
        throw new BadRequestException(
          'channelRoom or ownerId or userIdAdd  are null',
        );

      // Get el Channel
      const foundChatRoom = await this.prisma.chatRoom.findFirst({
        where: { name: channelName },
        include: {
          users: true,
        },
      });
      if (!foundChatRoom)
        throw new BadRequestException('channelRoom not exist');

      if (foundChatRoom.ownerId != ownerId)
        throw new BadRequestException('This is not the owner of the channel');

      // Add user
      if (foundChatRoom.type !== ChannelType.PRIVATE)
        throw new BadRequestException('Chat must be private');

      // Buscar si esta banneado
      const isUserAlreadyIn = foundChatRoom.users.some(
        (userss) => userss.userId === userIdAdd,
      );
      if (add == 1) {
        if (isUserAlreadyIn)
          throw new BadRequestException('This user already in this ChatRoom');

        // Add user
        await this.addUserToChannel(userIdAdd, channelName);
      } else if (add == 0) {
        if (!isUserAlreadyIn)
          throw new BadRequestException('This user is not in this ChatRoom');

        // Delete User
        await this.leaveUserFromChannel(channelName, userIdAdd);
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  // alternativa 2 para enviar mensages
  async getUsersFromChatRoom(roomName: string) {
    const chatRoom = await this.prisma.chatRoom.findFirst({
      where: { name: roomName },
      include: { users: true },
    });

    if (!chatRoom) {
      throw new BadRequestException('ChatRoom no encontrado');
    }

    return chatRoom.users;
  }

  async getBannedUser(): Promise<{
    found: number;
    data: { name: string; bannedUsers: UserRommDTO[] }[];
  }> {
    const chatRooms = await this.prisma.chatRoom.findMany({
      select: {
        name: true,
        id: true,
        bannedkList: true,
      },
    });
    const data = [];

    let length2 = 0;
    let userBanned = [];

    for (const room of chatRooms) {
      userBanned = [];
      if (room.bannedkList.length == 0) {
        continue;
      }
      length2++;
      let bannedUsers;

      for (const bannedUserId of room.bannedkList) {
        bannedUsers = await this.prisma.user.findFirst({
          where: {
            id: bannedUserId,
          },
        });
        userBanned.push(new UserRommDTO(bannedUsers, room.name));
      }
      data.push({
        name: room.name,
        bannedUsers: userBanned, // Ajusta según la estructura real de tu usuario
      });
    }

    if (data.length == 0) {
      data.push(userBanned);
    }

    if (length2 == 0) {
      return {
        found: 0,
        data: [],
      };
    }

    return {
      found: length2,
      data: data,
    };
  }
}
