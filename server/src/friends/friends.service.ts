import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  async addFriend(friendIntraId: number, user: User): Promise<any> {
    if (friendIntraId === user.intraId) {
      throw new BadRequestException('You cannot add yourself as a friend');
    }

    const friend = await this.prisma.user.findUnique({
      where: {
        intraId: friendIntraId,
      },
      include: {
        friends: true,
      },
    });

    if (!friend) {
      throw new BadRequestException('Friend not found');
    }

    const { friends: userFriends } = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        friends: true,
      },
    });

    // Delete all user friends
    await this.prisma.friend.deleteMany({
      where: {
        userId: user.id,
      },
    });

    let updatedUser;
    try {
      updatedUser = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          friends: {
            create: [
              ...userFriends.map((friend) => {
                return {
                  intraId: friend.intraId,
                  avatar: friend.avatar,
                };
              }),
              { intraId: friend.intraId, avatar: friend.avatar },
            ],
          },
        },
        include: {
          friends: true,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      )
        throw new ConflictException('Friend already added');
      throw e;
    }

    return {
      created: 1,
      data: {
        id: user.id,
        intraId: user.intraId,
        friends: updatedUser.friends.map((friend) => {
          return {
            intraId: friend.intraId,
            avatar: friend.avatar,
          };
        }),
      },
    };
  }

  //   async getFriends(intraId: number, user: User): Promise<any> {
  //     let userWithFriends;
  //     if (!intraId) {
  //       userWithFriends = await this.prisma.user.findUnique({
  //         where: {
  //           id: user.id,
  //         },
  //         include: {
  //           friends: true,
  //         },
  //       });
  //     } else {
  //       userWithFriends = await this.prisma.user.findUnique({
  //         where: {
  //           intraId: intraId,
  //         },
  //         include: {
  //           friends: true,
  //         },
  //       });
  //     }

  //     return {
  //       found: userWithFriends.friends.length,
  //       data: {
  //         id: userWithFriends.id,
  //         intraId: userWithFriends.intraId,
  //         friends: userWithFriends.friends,
  //       },
  //     };
  //   }
}
