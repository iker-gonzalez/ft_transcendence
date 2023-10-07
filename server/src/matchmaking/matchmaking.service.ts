import { Inject, Injectable } from '@nestjs/common';
import { NewQueuedUserDto } from './dto/new-queued-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { Server } from 'socket.io';
import { NewQueuedUserResponseDto } from './dto/new-queued-user-response.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

type QueueUser = {
  id: string;
  data: User;
};

@Injectable()
export class MatchmakingService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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

    const queue: QueueUser[] = (await this.cacheManager.get('queue')) || [];
    const isAlreadyQueued = queue.some((user: QueueUser) => {
      return user.data.intraId === userData.intraId;
    });

    if (isAlreadyQueued) {
      server.emit(`userJoined/${intraId}`, {
        queued: true,
        message: 'Already queued',
      });
      return;
    }

    await this.cacheManager.set('queue', [
      ...queue,
      { id: clientId, data: userData },
    ]);
    server.emit(`userJoined/${intraId}`, {
      queued: true,
    });

    const updatedQueue: QueueUser[] = await this.cacheManager.get('queue');
    if (updatedQueue.length >= 2) {
      const sessionUsers: QueueUser[] = [];

      sessionUsers.push(updatedQueue.shift());
      sessionUsers.push(updatedQueue.shift());

      await this.cacheManager.set('queue', updatedQueue);

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

      for (const user of session.players) {
        const newSessionPayload: NewQueuedUserResponseDto = {
          success: true,
          data: session,
        };

        server.emit(`newSession/${user.intraId}`, newSessionPayload);
      }
    }
  }

  async onRemoveUser(clientId: string): Promise<void> {
    const queue: QueueUser[] = (await this.cacheManager.get('queue')) || [];

    const updatedQueue: QueueUser[] = queue.filter((user) => {
      return user.id !== clientId;
    });
    await this.cacheManager.set('queue', updatedQueue);
  }

  async removeUserFromQueue(
    server: Server,
    clientId: string,
    body: string,
  ): Promise<void> {
    const parsedBody: NewQueuedUserDto = JSON.parse(body);
    const intraId = Number(parsedBody.intraId);

    if (!intraId) {
      server.emit(`unqueuedUser/${parsedBody.intraId}`, {
        queued: true,
        message: 'Invalid intraId',
      });
      return;
    }

    const queue: QueueUser[] = (await this.cacheManager.get('queue')) || [];

    const updatedQueue: QueueUser[] = queue.filter(
      (user: QueueUser) => user.id !== clientId,
    );
    await this.cacheManager.set('queue', updatedQueue);

    server.emit(`unqueuedUser/${parsedBody.intraId}`, {
      queued: false,
    });
  }
}
