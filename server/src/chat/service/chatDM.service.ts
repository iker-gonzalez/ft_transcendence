import { BadRequestException, ConsoleLogger, Injectable } from '@nestjs/common';
import { DirectMessage, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GetDirectMessageDto } from './../dto/get-direct-message.dto';
import { AddMessageToUserDto } from './../dto/add-message.dto';
import { UserService } from '../../user/user.service';
import { ConversationMessageDTO } from './../dto/conversation-message.dto';
import { AllUsersDMWithDTO } from './../dto/all-users-DM-with.dto';

@Injectable()
export class ChatDMService {
  constructor(private readonly prisma: PrismaService) {}

  /********************************************************** */
  //                     END POINT GETTER                     //
  /********************************************************** */
  // Sens DM between two user, sorted by time created.
  async getDMBetweenUsers(
    userId1: string,
    userId2: string,
  ): Promise<ConversationMessageDTO[]> {
    if (
      (await this.isUserMuted(userId1, userId2)) ||
      (await this.isUserMuted(userId2, userId1))
    ) {
      return [];
    }

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

    // Para tener el avatar y el username de los usuarios, creo una DTO y se lo añado
    const user1 = await this.prisma.user.findUnique({ where: { id: userId1 } });
    const user2 = await this.prisma.user.findUnique({ where: { id: userId2 } });
    // Mapea los objetos de mensajes a ConversationMessageDTO
    const conversationDTO = [];
    for (const message of conversationMessages) {
      if (message.senderId == userId1) {
        conversationDTO.push(
          new ConversationMessageDTO(message, user1, user2, null),
        );
      } else
        conversationDTO.push(
          new ConversationMessageDTO(message, user2, user1, null),
        );
    }
    return conversationDTO;
  }

  // Get all the DM conversation the user had had with other users
  async getAllUserDMWith(userId: string): Promise<AllUsersDMWithDTO[]> {
    if (userId == null)
      throw new BadRequestException('User Id not found in DB');

    const usersWithConversations = await this.prisma.directMessage.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      distinct: ['senderId', 'receiverId'], // Selecciona valores únicos de senderId y receiverId
      select: {
        senderId: true,
        receiverId: true,
      },
    });

    // Juntar los mensajes de senderId y receiverId en un solo arrau
    const allUsers = [
      ...usersWithConversations.map((message) => message.senderId),
      ...usersWithConversations.map((message) => message.receiverId),
    ];

    // Eliminar los usruarios repetidos y el propio usuario
    const uniqueUsers = Array.from(new Set(allUsers)).filter(
      (user) => user !== userId,
    );

    const userObjId = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        blockList: true,
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        friends: true,
      },
    });
    const userFriendsList = user.friends.map((friend) => friend.intraId);

    // Crear DTO para enviar el is del usuario, el avartar y el nombre
    const allUserDMWithDTO = [];
    for (const userId2 of uniqueUsers) {
      const userObj = await this.prisma.user.findUnique({
        where: { id: userId2 },
        select: {
          avatar: true,
          intraId: true,
          username: true,
        },
      });

      if (!userFriendsList.includes(userObj.intraId)) {
        continue;
      }

      const userDTO = new AllUsersDMWithDTO();
      userDTO.id = userId2;
      userDTO.avatar = userObj.avatar;
      userDTO.username = userObj.username;
      userDTO.intraId = userObj.intraId;
      const isBlocked = userObjId.blockList.some(
        (blockUser) => blockUser === userId2,
      );
      userDTO.isBlocked = isBlocked;
      allUserDMWithDTO.push(userDTO);
    }

    const sortedAllUserDMWithDTO = allUserDMWithDTO.sort((a, b) => {
      return a.username.localeCompare(b.username);
    });

    return sortedAllUserDMWithDTO;
  }

  async findUserIdByIntraId(intraId: number): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: {
        intraId: intraId,
      },
    });

    return user ? user.id : null;
  }

  async findUserIntraById(Id: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: Id,
      },
    });

    return user ? user.intraId : 0;
  }
  /********************************************************** */
  //                     DM FUNCIONALITY                      //
  /********************************************************** */
  async addMessageToUser(
    userSenderId: string,
    userReceiverId: string,
    content: string,
  ): Promise<boolean> {
    try {
      if (!userSenderId || !userReceiverId)
        throw new BadRequestException(
          'userSender or userReceiver does not exist in DB',
        );

      if (content.length > 124 || content.length < 1)
        throw new BadRequestException(
          'Message length must be between 1 and 124 characters',
        );

      const existingMessage = await this.prisma.directMessage.findUnique({
        where: { id: userSenderId },
      });

      const isMuted = await this.isUserMuted(userSenderId, userReceiverId);
      if (isMuted)
        throw new BadRequestException('Cannot sent message, user is muted');

      if (!existingMessage || existingMessage) {
        // El registro no se encontró, así que créalo
        const newMessage = await this.prisma.directMessage.create({
          data: {
            senderId: userSenderId,
            receiverId: userReceiverId,
            content: content,
          },
        });
      }
    } catch (e) {
      throw new BadRequestException(e);
    }

    return true;
  }

  async blockUserDM(userId: string, userToMuteId: string): Promise<void> {
    try {
      if (!userId || !userToMuteId)
        throw new BadRequestException(
          'userId or userToMuteId does not exist in DB',
        );

      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      const blockList = user.blockList;
      if (blockList.includes(userToMuteId)) {
        throw new BadRequestException('User already blocked');
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          blockList: [...user.blockList, userToMuteId],
        },
      });

      // const userToMute = await this.prisma.user.findUnique({
      //   where: {
      //     id: userToMuteId,
      //   },
      // });

      // await this.prisma.user.update({
      //   where: { id: userToMuteId },
      //   data: {
      //     blockList: [...userToMute.blockList, userId],
      //   },
      // });
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async unblockUserDM(userId: string, userToUnMuteId: string): Promise<void> {
    try {
      if (!userId || !userToUnMuteId)
        throw new BadRequestException(
          'userId or userToMuteId does not exist in DB',
        );

      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      const isMuted = await this.isUserMuted(userId, userToUnMuteId);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          blockList: user.blockList.filter((id) => id !== userToUnMuteId),
        },
      });

      // const userToUnmute = await this.prisma.user.findUnique({
      //   where: {
      //     id: userToUnMuteId,
      //   },
      // });

      // await this.prisma.user.update({
      //   where: { id: userToUnMuteId },
      //   data: {
      //     blockList: userToUnmute.blockList.filter((id) => id !== userId),
      //   },
      // });
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async isUserMuted(userId: string, blockedUserId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException(`User with ID ${userId} not found`);
    }

    return user.blockList.includes(blockedUserId);
  }
}
