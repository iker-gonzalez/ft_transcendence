import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MulterFileDto } from './dto/multer-file.dto';
import { createWriteStream } from 'fs';
import * as path from 'path';
import * as fs from 'fs';
import { UpdateUsernameResponseDto } from './dto/update-username-response.dto';
import { UpdateAvatarResponseDto } from './dto/update-avatar-response.dto';
import { ConfigService } from '@nestjs/config';
import UserCoreData from 'src/types/user-core-data.type';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async updateUsername(
    user: User,
    username: string,
  ): Promise<UpdateUsernameResponseDto> {
    const userData: User = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!userData) {
      throw new BadRequestException();
    }

    if (userData.username === username) {
      throw new BadRequestException(['Provide a new username']);
    }

    try {
      const newUserData: User = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          username,
        },
      });

      return {
        updated: 1,
        data: {
          id: newUserData.id,
          intraId: newUserData.intraId,
          username: newUserData.username,
        },
      };
    } catch (e) {
      if (e.code === 'P2002')
        throw new BadRequestException(['Username already exists']);
    }
  }

  async updateAvatar(
    user: User,
    file: MulterFileDto,
  ): Promise<UpdateAvatarResponseDto> {
    if (!file) {
      throw new BadRequestException();
    }

    const { mimetype, size }: { mimetype: string; size: number } = file;

    const isImage: boolean = mimetype.startsWith('image/');
    if (!isImage) {
      throw new BadRequestException('File is not an image');
    }

    const isSizeValid: boolean = size >= 5_000 && size <= 2_500_000;

    if (!isSizeValid) {
      throw new BadRequestException('File should be between 5KB and 2.5MB');
    }

    const avatarsFolderPath: string = path.join('uploads', 'avatars');
    const avatarsFolderPublicPath: string = path.join(
      'public',
      avatarsFolderPath,
    );
    const newAvatarName: string =
      user.username.toLowerCase() +
      '_' +
      new Date().valueOf().toString() +
      '.' +
      file.originalname.split('.').pop();

    if (!fs.existsSync(avatarsFolderPublicPath)) {
      fs.mkdirSync(avatarsFolderPublicPath);
    }
    const ws: fs.WriteStream = createWriteStream(
      path.join(avatarsFolderPublicPath, newAvatarName),
    );
    ws.write(file.buffer);

    const avatarUrl: string = encodeURI(
      `http://localhost:${this.configService.get('API_PORT')}/${path.join(
        avatarsFolderPath,
        newAvatarName,
      )}`,
    );

    const newUserData: User = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatar: avatarUrl,
      },
    });

    return {
      updated: 1,
      data: {
        id: user.id,
        intraId: user.intraId,
        avatar: newUserData.avatar,
      },
    };
  }

  async getUsersByName(query: string): Promise<any> {
    const friends: UserCoreData[] = await this.prisma.user.findMany({
      where: {
        username: {
          contains: query,
        },
      },
      select: {
        intraId: true,
        username: true,
        avatar: true,
        email: true,
      },
    });

    return {
      found: friends.length,
      data: {
        friends,
      },
    };
  }
}
