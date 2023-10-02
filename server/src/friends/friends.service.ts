import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Friend, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetFriendsResponseDto } from './dto/get-friends-response.dto';
import { AddFriendResponseDto } from './dto/add-friend-response.dto';

type FriendInfo = {
  intraId: number;
  avatar: string;
  username: string;
  email: string;
};

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  async addFriend(
    friendIntraId: number,
    user: User,
  ): Promise<AddFriendResponseDto> {
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

    const { friends: userFriends }: { friends: Friend[] } =
      await this.prisma.user.findUnique({
        where: {
          id: user.id,
        },
        include: {
          friends: true,
        },
      });

    if (userFriends.some((friend) => friend.intraId === friendIntraId)) {
      throw new ConflictException('Friend already added');
    }

    // Delete all user friends
    if (userFriends.length > 0) {
      await this.prisma.friend.deleteMany({
        where: {
          userId: user.id,
        },
      });
    }

    let updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        friends: {
          create: this._computeFriends(userFriends, friend),
        },
      },
      include: {
        friends: true,
      },
    });

    // Delete all friend's friends
    if (friend.friends.length > 0) {
      await this.prisma.friend.deleteMany({
        where: {
          userId: friend.id,
        },
      });
    }

    await this.prisma.user.update({
      where: {
        id: friend.id,
      },
      data: {
        friends: {
          create: this._computeFriends(friend.friends, updatedUser),
        },
      },
      include: {
        friends: true,
      },
    });

    return {
      created: 1,
      data: {
        id: user.id,
        intraId: user.intraId,
        friends: updatedUser.friends,
      },
    };
  }

  async getFriends(
    intraId: number,
    user: User,
  ): Promise<GetFriendsResponseDto> {
    const userWithFriends = await this.prisma.user.findUnique({
      where: {
        intraId: intraId ? intraId : user.intraId,
      },
      include: {
        friends: true,
      },
    });

    if (!userWithFriends) {
      throw new BadRequestException('User not found');
    }

    return {
      found: userWithFriends.friends.length,
      data: {
        id: userWithFriends.id,
        intraId: userWithFriends.intraId,
        friends: userWithFriends.friends,
      },
    };
  }

  async deleteFriend(friendIntraId: number, user: User): Promise<any> {
    const userData = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        friends: true,
      },
    });

    const isValidFriend = userData.friends.some(
      (friend) => friend.intraId === friendIntraId,
    );

    if (!isValidFriend) {
      throw new BadRequestException('Friend not found');
    }

    const updatedFriends = userData.friends.filter(
      (friend) => friend.intraId !== friendIntraId,
    );

    // To avoid errors with prisma, we need to delete the userId field
    updatedFriends.forEach((friend) => {
      delete friend.userId;
    });

    await this.prisma.friend.deleteMany({
      where: {
        userId: user.id,
      },
    });

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        friends: {
          create: updatedFriends,
        },
      },
      include: {
        friends: true,
      },
    });

    return {
      deleted: 1,
      data: {
        id: updatedUser.id,
        intraId: updatedUser.intraId,
        friends: updatedUser.friends,
      },
    };
  }

  _computeFriends(currentFriends: Friend[], newFriend: User): FriendInfo[] {
    return [
      ...currentFriends.map((friend) => {
        return {
          intraId: friend.intraId,
          avatar: friend.avatar,
          username: friend.username,
          email: friend.email,
        };
      }),
      {
        intraId: newFriend.intraId,
        avatar: newFriend.avatar,
        username: newFriend.username,
        email: newFriend.email,
      },
    ];
  }
}
