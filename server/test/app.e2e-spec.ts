import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { IntraService } from '../src/intra/intra.service';
import * as pactum from 'pactum';
import { createUser } from './test.utils';
import * as fs from 'fs';
import { cwd } from 'process';

describe('App e2e', () => {
  const port = 3333;
  const baseUrl = `http://localhost:${port}`;

  let app: INestApplication;
  let prisma: PrismaService;
  let intraService: IntraService;

  const userData = {
    intraId: 88103,
    username: 'ntest',
    email: 'test@student.42urduliz.com',
    avatar: 'https://cdn.intra.42.fr/users/test.jpg',
  };

  const intraUserToken =
    'de08a5e57571452221f95fc44d0073d2a383178d7d893d99c29ad955103b3981';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(port);

    prisma = app.get(PrismaService);
    intraService = app.get(IntraService);

    pactum.request.setBaseUrl(baseUrl);
  });

  beforeEach(async () => {
    await prisma.cleanDb();
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    describe('signin', () => {
      it('should sign in user', async () => {
        jest
          .spyOn(intraService, 'getIntraUserToken')
          .mockImplementation(async (code: string): Promise<string> => {
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
          .expectStatus(200)
          .expectJsonLike({
            created: 1,
            access_token: /.*/,
            data: userData,
          });

        const user = await prisma.user.findUnique({
          where: { intraId: userData.intraId },
        });
        expect(user).not.toBeNull();
      });

      it('should return 400 if state is not valid', async () => {
        const reqBody = {
          code: intraUserToken,
          state: 'invalid-state',
        };

        await pactum
          .spec()
          .post('/auth/intra/signin')
          .withBody(reqBody)
          .expectStatus(400);

        const user = await prisma.user.findMany({});
        expect(user).toHaveLength(0);
      });

      it('should return 400 if code is not valid', async () => {
        const reqBody = {
          code: 'invalid-code',
          state: process.env.INTRA_STATE,
        };

        await pactum
          .spec()
          .post('/auth/intra/signin')
          .withBody(reqBody)
          .expectStatus(400);

        const user = await prisma.user.findMany({});
        expect(user).toHaveLength(0);
      });

      it('should return 400 if code and state are not provided', async () => {
        await pactum.spec().post('/auth/intra/signin').expectStatus(400);

        const user = await prisma.user.findMany({});
        expect(user).toHaveLength(0);
      });
    });
  });

  describe('User', () => {
    describe('me', () => {
      it("should return current user's data", async () => {
        // Create user first
        const user = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData,
        );

        await pactum
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200)
          .expectJson({
            data: JSON.parse(JSON.stringify(user)),
          });
      });

      it('should return 401 if token is not provided', async () => {
        await pactum.spec().get('/users/me').expectStatus(401).expectJson({
          message: 'Unauthorized',
          statusCode: 401,
        });
      });

      it('should return 401 if token is not valid', async () => {
        await pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization:
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
          })
          .expectStatus(401);
      });
    });

    describe('update username', () => {
      it('should update username', async () => {
        const newUsername = 'new-username';

        // Create user first
        const user = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData,
        );

        await pactum
          .spec()
          .patch(`/users/${user.id}/username`)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody({
            username: 'new-username',
          })
          .expectStatus(200)
          .expectJsonLike({
            updated: 1,
            data: {
              ...userData,
              username: newUsername,
            },
          });

        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        expect(updatedUser.username).toBe(newUsername);
      });

      it('should return 400 if username is below 5 characters', async () => {
        const newUsername = 'abcd';

        // Create user first
        const user = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData,
        );

        await pactum
          .spec()
          .patch(`/users/${user.id}/username`)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody({
            username: newUsername,
          })
          .expectStatus(400);

        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        expect(updatedUser.username).toBe(user.username);
      });

      it('should return 400 if username is below over 12 characters', async () => {
        const newUsername = 'new-long-username';

        // Create user first
        const user = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData,
        );

        await pactum
          .spec()
          .patch(`/users/${user.id}/username`)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody({
            username: newUsername,
          })
          .expectStatus(400);

        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        expect(updatedUser.username).toBe(user.username);
      });

      it('should return 400 if provided id does not match current user', async () => {
        const newUsername = 'new-username';

        // Create user first
        const user = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData,
        );

        await pactum
          .spec()
          .patch(`/users/ac6f32be-a676-4e3b-a987-8bc2c1d3d010/username`)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody({
            username: newUsername,
          })
          .expectStatus(400);

        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        expect(updatedUser.username).toBe(user.username);
      });

      it('should return 401 with invalid token', async () => {
        const newUsername = 'new-username';

        // Create user first
        const user = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData,
        );

        await pactum
          .spec()
          .patch(`/users/${user.id}/username`)
          .withHeaders({
            Authorization:
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
          })
          .withBody({
            username: newUsername,
          })
          .expectStatus(401);

        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        expect(updatedUser.username).toBe(user.username);
      });
    });

    describe('update avatar', () => {
      it('should update username', async () => {
        // Create user first
        const user = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData,
        );

        const FormData = require('form-data-lite');
        const form = new FormData();
        form.append('avatar', fs.readFileSync('test/assets/file_example.png'), {
          filename: 'avatar.png',
        });

        await pactum
          .spec()
          .patch(`/users/avatar`)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withMultiPartFormData(form)
          .expectStatus(200)
          .expectJsonLike({
            updated: 1,
            data: {
              ...userData,
              avatar: new RegExp(`^.*${user.username}.png$`),
            },
          });

        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        expect(updatedUser.avatar).toMatch(
          new RegExp(`^.*${user.username}.png$`),
        );
      });
    });
  });
});
