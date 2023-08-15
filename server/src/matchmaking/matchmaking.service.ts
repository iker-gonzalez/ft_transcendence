import { Injectable } from '@nestjs/common';
import { NewQueuedUserDto } from './dto/new-queued-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { Server } from 'socket.io';

@Injectable()
export class MatchmakingService {
  constructor(private readonly prisma: PrismaService) {}

  queue: { id: string; data: User }[] = [];

  async addUserToQueue(
    server: Server,
    clientId: string,
    body: string,
  ): Promise<void> {
    const parsedBody: NewQueuedUserDto = JSON.parse(body);
    const intraId = Number(parsedBody.intraId);

    if (!intraId) {
      server.emit(`userJoined/${parsedBody.intraId}`, {
        queued: false,
        message: 'Invalid intraId',
      });
      return;
    }

    let userData: User;
    try {
      userData = await this.prisma.user.findUniqueOrThrow({
        where: {
          intraId: intraId,
        },
      });
    } catch (error) {
      server.emit(`userJoined/${intraId}`, {
        queued: false,
        message: 'User not found',
      });

      return;
    }

    const isAlreadyQueued = this.queue.some((user) => {
      return user.data.intraId === userData.intraId;
    });

    if (isAlreadyQueued) {
      server.emit(`userJoined/${intraId}`, {
        queued: true,
        message: 'Already queued',
      });
      return;
    }

    this.queue = [...this.queue, { id: clientId, data: userData }];
    server.emit(`userJoined/${intraId}`, {
      queued: true,
    });

    if (this.queue.length >= 2) {
      const sessionUsers: { id: string; data: User }[] = [];

      sessionUsers.push(this.queue.shift());
      sessionUsers.push(this.queue.shift());

      const session = await this.prisma.userGameSession.create({
        data: {
          players: {
            createMany: {
              data: sessionUsers.map((user) => {
                const publicUserData = {
                  intraId: user.data.intraId,
                  avatar: user.data.avatar,
                  username: user.data.username,
                  email: user.data.email,
                };

                return publicUserData;
              }),
            },
          },
        },
        include: {
          players: true,
        },
      });

      if (!session) {
        server.emit(`newSession/${intraId}`, {
          success: false,
          message: 'Error creating session',
        });

        return;
      }

      for (let user of session.players) {
        server.emit(`newSession/${user.intraId}`, {
          success: true,
          data: session,
        });
      }
    }
  }

  async onRemoveUser(clientId: string): Promise<void> {
    this.queue = this.queue.filter((user) => {
      return user.id !== clientId;
    });
  }
}
