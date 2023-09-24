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
    const userData = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!userData) {
      throw new BadRequestException();
    }

    try {
      const newUserData = await this.prisma.user.update({
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
        throw new BadRequestException('Username already taken');
    }
  }

  async updateAvatar(
    user: User,
    file: MulterFileDto,
  ): Promise<UpdateAvatarResponseDto> {
    if (!file) {
      throw new BadRequestException();
    }

    const { mimetype, size } = file;

    const userData = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });
    const isImage = mimetype.startsWith('image/');
    const isSizeValid = size >= 50_000 && size <= 2_500_000;

    if (!isImage || !isSizeValid) {
      throw new BadRequestException();
    }

    const avatarsFolderPath = path.join('uploads', 'avatars');
    const avatarsFolderPublicPath = path.join('public', avatarsFolderPath);
    const newAvatarName =
      user.username + '.' + file.originalname.split('.').pop();

    if (!fs.existsSync(avatarsFolderPublicPath)) {
      fs.mkdirSync(avatarsFolderPublicPath);
    }
    const ws = createWriteStream(
      path.join(avatarsFolderPublicPath, newAvatarName),
    );
    ws.write(file.buffer);

    const avatarUrl = path.join(
      `http://localhost:${this.configService.get('API_PORT')}`,
      avatarsFolderPath,
      newAvatarName,
    );

    const newUserData = await this.prisma.user.update({
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
}
