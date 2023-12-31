import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Friend, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetFriendsResponseDto } from './dto/get-friends-response.dto';
import { AddFriendResponseDto } from './dto/add-friend-response.dto';
import { DeleteFriendResponseDto } from './dto/delete-friend-response.dto';

interface UserWithFriends extends User {
  friends: Friend[];
}

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

    // Fetch user friends
    const { friends: userFriends }: { friends: Friend[] } =
      await this.prisma.user.findUnique({
        where: {
          id: user.id,
        },
        include: {
          friends: true,
        },
      });

    // Friend is already added
    if (userFriends.some((friend) => friend.intraId === friendIntraId)) {
      throw new ConflictException('Friend already added');
    }

    // Fetch friend data
    const friend: UserWithFriends = await this.prisma.user.findUnique({
      where: {
        intraId: friendIntraId,
      },
      include: {
        friends: true,
      },
    });

    // Friend does not exist
    if (!friend) {
      throw new BadRequestException('Friend not found');
    }

    const updatedUser = await this._addFriendToDb(user.id, userFriends, friend);

    await this._addFriendToDb(friend.id, friend.friends, updatedUser);

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
    const userWithFriends: UserWithFriends = await this.prisma.user.findUnique({
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

  async deleteFriend(
    friendIntraId: number,
    user: User,
  ): Promise<DeleteFriendResponseDto> {
    const userData: UserWithFriends = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        friends: true,
      },
    });

    const isValidFriend: boolean = userData.friends.some(
      (friend) => friend.intraId === friendIntraId,
    );

    if (!isValidFriend) {
      throw new BadRequestException('Friend not found');
    }

    const updatedFriends: Friend[] = userData.friends.filter(
      (friend) => friend.intraId !== friendIntraId,
    );

    const updatedUser: UserWithFriends = await this._deleteFriendFromDb(
      user.id,
      updatedFriends,
    );

    const toBeDeletedFriendData: UserWithFriends =
      await this.prisma.user.findUnique({
        where: {
          intraId: friendIntraId,
        },
        include: {
          friends: true,
        },
      });

    const otherUserUpdatedFriends: Friend[] =
      toBeDeletedFriendData.friends.filter(
        (friend) => friend.intraId !== user.intraId,
      );
    this._deleteFriendFromDb(toBeDeletedFriendData.id, otherUserUpdatedFriends);

    return {
      deleted: 1,
      data: {
        id: updatedUser.id,
        intraId: updatedUser.intraId,
        friends: updatedUser.friends,
      },
    };
  }

  _addFriendToDb = async (
    userId: string,
    userFriends: Friend[],
    friend,
  ): Promise<UserWithFriends> => {
    // Delete all user friends
    if (userFriends.length > 0) {
      await this.prisma.friend.deleteMany({
        where: {
          userId: userId,
        },
      });
    }

    const updatedUser: UserWithFriends = await this.prisma.user.update({
      where: {
        id: userId,
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

    return updatedUser;
  };

  _deleteFriendFromDb = async (userId: string, updatedFriends: Friend[]) => {
    // To avoid errors with prisma, we need to delete the userId field
    updatedFriends.forEach((friend) => {
      delete friend.userId;
    });

    await this.prisma.friend.deleteMany({
      where: {
        userId,
      },
    });

    const updatedUser: UserWithFriends = await this.prisma.user.update({
      where: {
        id: userId,
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

    return updatedUser;
  };

  _computeFriends(
    currentFriends: Friend[],
    newFriend: UserWithFriends,
  ): FriendInfo[] {
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
