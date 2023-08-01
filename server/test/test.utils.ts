import { User } from '@prisma/client';
import { IntraUserDataDto } from 'src/auth/dto/intra-user-data.dto';
import { IntraService } from 'src/intra/intra.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as pactum from 'pactum';

export async function createUser(
  prisma: PrismaService,
  intraService: IntraService,
  intraUserToken: string,
  userData: IntraUserDataDto,
): Promise<User> {
  jest
    .spyOn(intraService, 'getIntraUserToken')
    .mockImplementation(async (): Promise<string> => {
      return Promise.resolve(intraUserToken);
    });
  jest
    .spyOn(intraService, 'getIntraUserInfo')
    .mockImplementation(async (token: string): Promise<any> => {
      return Promise.resolve(userData);
    });

  const reqBody = {
    code: intraUserToken,
    state: process.env.INTRA_STATE,
  };

  await pactum
    .spec()
    .post('/auth/intra/signin')
    .withBody(reqBody)
    .stores('userAt', 'access_token');

  const user = await prisma.user.findUnique({
    where: { intraId: userData.intraId },
  });

  return user;
}

export async function createGameSession(
  prisma: PrismaService,
  ball,
  player1,
  player2,
): Promise<any> {
  await pactum
    .spec()
    .post('/game/sessions/new')
    .withBody({
      ball: JSON.stringify(ball),
      player1: JSON.stringify(player1),
      player2: JSON.stringify(player2),
    });

  const session = await prisma.gameSession.findFirst({
    include: {
      ball: true,
      players: true,
    },
  });

  return session;
}

export async function createUserWithFriends(
  prisma: PrismaService,
  intraService: IntraService,
  intraUserToken: string,
  userData: IntraUserDataDto,
  friendsData: any[],
): Promise<User> {
  // Create users to be added as friends
  for (const friendData of friendsData) {
    await createUser(prisma, intraService, intraUserToken, friendData);
  }

  // Create user first
  const user = await createUser(prisma, intraService, intraUserToken, userData);

  for (const friend of friendsData) {
    await pactum
      .spec()
      .post(`/friends/${friend.intraId}`)
      .withHeaders({ Authorization: 'Bearer $S{userAt}' });
  }

  return user;
}
