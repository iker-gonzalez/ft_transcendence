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
