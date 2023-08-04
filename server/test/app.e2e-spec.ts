import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { IntraService } from '../src/intra/intra.service';
import * as pactum from 'pactum';
import {
  createGameSession,
  createUser,
  createUserWithFriends,
} from './test.utils';
import * as fs from 'fs';
import { TwoFactorAuthService } from '../src/two-factor-auth/two-factor-auth.service';
import { testUserData } from '../config/app.constants';

describe('App e2e', () => {
  const port = 3333;
  const baseUrl = `http://localhost:${port}`;

  let app: INestApplication;
  let prisma: PrismaService;
  let intraService: IntraService;
  let twoFactorAuthService: TwoFactorAuthService;

  const userData = {
    intraId: 88103,
    username: 'ntest',
    email: 'test@student.42urduliz.com',
    avatar: 'https://cdn.intra.42.fr/users/test.jpg',
  };

  const userData2 = {
    intraId: 88104,
    username: 'ntest2',
    email: 'test2@student.42urduliz.com',
    avatar: 'https://cdn.intra.42.fr/users/test2.jpg',
  };

  const userData3 = {
    intraId: 88105,
    username: 'ntest3',
    email: 'test3@student.42urduliz.com',
    avatar: 'https://cdn.intra.42.fr/users/test3.jpg',
  };

  const testAvatarPath = `public/uploads/avatars/${userData.username}.png`;

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
    twoFactorAuthService = app.get(TwoFactorAuthService);

    pactum.request.setBaseUrl(baseUrl);
  });

  beforeEach(async () => {
    await prisma.cleanDb();
  });

  afterEach(async () => {
    jest.resetAllMocks();

    if (fs.existsSync(testAvatarPath)) fs.unlinkSync(testAvatarPath);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    describe('signin', () => {
      it('should sign up user', async () => {
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

      it('should sign in user', async () => {
        // Create user first
        const user = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData,
        );

        jest
          .spyOn(intraService, 'getIntraUserToken')
          .mockImplementation(async (): Promise<string> => {
            return Promise.resolve(intraUserToken);
          });

        jest
          .spyOn(intraService, 'getIntraUserInfo')
          .mockImplementation(async (): Promise<any> => {
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
            created: 0,
            access_token: /.*/,
            data: userData,
          });
      });

      it('should sign in user with OTP', async () => {
        // Create user first
        const user = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData,
        );

        await prisma.user.update({
          where: { id: user.id },
          data: {
            isTwoFactorAuthEnabled: true,
          },
        });

        jest
          .spyOn(twoFactorAuthService, 'isTwoFactorAuthenticationCodeValid')
          .mockImplementation((): boolean => {
            return true;
          });

        const reqBody = {
          code: intraUserToken,
          state: process.env.INTRA_STATE,
          otp: '123456',
        };

        await pactum
          .spec()
          .post('/auth/intra/signin')
          .withBody(reqBody)
          .expectStatus(200)
          .expectJsonLike({
            created: 0,
            access_token: /.*/,
            data: userData,
          });
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

      it('should return 401 if OTP is not valid', async () => {
        // Create user first
        const user = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData,
        );

        await prisma.user.update({
          where: { id: user.id },
          data: {
            isTwoFactorAuthEnabled: true,
          },
        });

        jest
          .spyOn(twoFactorAuthService, 'isTwoFactorAuthenticationCodeValid')
          .mockImplementation((): boolean => {
            return false;
          });

        const reqBody = {
          code: intraUserToken,
          state: process.env.INTRA_STATE,
          otp: '123456',
        };

        await pactum
          .spec()
          .post('/auth/intra/signin')
          .withBody(reqBody)
          .expectStatus(401);
      });
    });

    describe('test user', () => {
      const currentTestUserData = testUserData;
      const testUserCode = process.env.FAKE_USER_1_CODE;

      it('should sign up test user', async () => {
        const reqBody = {
          code: testUserCode,
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
            data: currentTestUserData,
          });

        const user = await prisma.user.findUnique({
          where: { intraId: currentTestUserData.intraId },
        });
        expect(user).not.toBeNull();
      });

      it('should sign in user', async () => {
        // Create user first
        const user = await createUser(
          prisma,
          intraService,
          intraUserToken,
          testUserData,
        );

        const reqBody = {
          code: testUserCode,
          state: process.env.INTRA_STATE,
        };

        await pactum
          .spec()
          .post('/auth/intra/signin')
          .withBody(reqBody)
          .expectStatus(200)
          .expectJsonLike({
            created: 0,
            access_token: /.*/,
            data: currentTestUserData,
          });
      });

      it('should sign in user with OTP', async () => {
        // Create user first
        const user = await createUser(
          prisma,
          intraService,
          intraUserToken,
          testUserData,
        );

        const reqBody = {
          code: testUserCode,
          state: process.env.INTRA_STATE,
          otp: '999999',
        };

        await pactum
          .spec()
          .post('/auth/intra/signin')
          .withBody(reqBody)
          .expectStatus(200)
          .expectJsonLike({
            created: 0,
            access_token: /.*/,
            data: currentTestUserData,
          });
      });
    });
  });

  describe('2FA', () => {
    it('it should activate 2FA', async () => {
      // Create user first
      const user = await createUser(
        prisma,
        intraService,
        intraUserToken,
        userData,
      );

      jest
        .spyOn(twoFactorAuthService, 'isTwoFactorAuthenticationCodeValid')
        .mockImplementation((): boolean => {
          return true;
        });

      const reqBody = {
        otp: '123456',
      };

      await pactum
        .spec()
        .post('/2fa/activate')
        .withHeaders({ Authorization: 'Bearer $S{userAt}' })
        .withBody(reqBody)
        .expectStatus(200)
        .expectJson({
          updated: 1,
        });

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(updatedUser.isTwoFactorAuthEnabled).toBe(true);
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

        // 2FA secret is not shared with client
        delete user.twoFactorAuthSecret;

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
          .patch(`/users/username`)
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
              id: user.id,
              intraId: user.intraId,
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
          .patch(`/users/username`)
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

      it('should return 400 if username is over 12 characters', async () => {
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
          .patch(`/users/username`)
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
          .patch(`/users/username`)
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
      it('should update avatar', async () => {
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
              id: user.id,
              intraId: user.intraId,
              avatar: new RegExp(`^.*${user.username}.png$`),
            },
          });

        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        expect(updatedUser.avatar).toMatch(
          new RegExp(`^.*${user.username}.png$`),
        );

        const filesExists = fs.existsSync(testAvatarPath);
        expect(filesExists).toBe(true);
      });

      it('should return 400 if no file is uploaded', async () => {
        // Create user first
        const user = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData,
        );

        const FormData = require('form-data-lite');
        const form = new FormData();
        form.append('avatar', fs.readFileSync('test/assets/file.txt'), {
          filename: 'file.txt',
        });

        await pactum
          .spec()
          .patch(`/users/avatar`)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(400);

        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        expect(updatedUser.avatar).toBe(userData.avatar);
        const filesExists = fs.existsSync(testAvatarPath);
        expect(filesExists).toBe(false);
      });

      it('should return 400 if file is not image', async () => {
        // Create user first
        const user = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData,
        );

        const FormData = require('form-data-lite');
        const form = new FormData();
        form.append('avatar', fs.readFileSync('test/assets/file.txt'), {
          filename: 'file.txt',
        });

        await pactum
          .spec()
          .patch(`/users/avatar`)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withMultiPartFormData(form)
          .expectStatus(400);

        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        expect(updatedUser.avatar).toBe(userData.avatar);
        const filesExists = fs.existsSync(testAvatarPath);
        expect(filesExists).toBe(false);
      });

      it('should return 400 if file is too little', async () => {
        // Create user first
        const user = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData,
        );

        const FormData = require('form-data-lite');
        const form = new FormData();
        form.append(
          'avatar',
          fs.readFileSync('test/assets/file_example_small.png'),
          {
            filename: 'file_example_small.png',
          },
        );

        await pactum
          .spec()
          .patch(`/users/avatar`)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withMultiPartFormData(form)
          .expectStatus(400);

        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        expect(updatedUser.avatar).toBe(userData.avatar);
        const filesExists = fs.existsSync(testAvatarPath);
        expect(filesExists).toBe(false);
      });

      it('should return 400 if file is too big', async () => {
        // Create user first
        const user = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData,
        );

        const FormData = require('form-data-lite');
        const form = new FormData();
        form.append(
          'avatar',
          fs.readFileSync('test/assets/file_example_big.png'),
          {
            filename: 'file_example_big.png',
          },
        );

        await pactum
          .spec()
          .patch(`/users/avatar`)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withMultiPartFormData(form)
          .expectStatus(400);

        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        expect(updatedUser.avatar).toBe(userData.avatar);
        const filesExists = fs.existsSync(testAvatarPath);
        expect(filesExists).toBe(false);
      });
    });
  });

  describe('Friends', () => {
    describe('new', () => {
      test('it should add another user as friend', async () => {
        // Create user that will be added as friend
        const user2 = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData2,
        );

        // Create user first
        // Must be done after user2 is created for correct bearer token
        const user1 = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData,
        );

        await pactum
          .spec()
          .post(`/friends/${user2.intraId}`)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200)
          .expectJsonLike({
            created: 1,
            data: {
              id: user1.id,
              intraId: user1.intraId,
              friends: [{ intraId: user2.intraId, avatar: user2.avatar }],
            },
          });

        const { friends: updatedUserFriends } = await prisma.user.findUnique({
          where: { id: user1.id },
          include: {
            friends: true,
          },
        });

        expect(updatedUserFriends).toHaveLength(1);
      });

      test('it should add a friend when user has already one', async () => {
        // Create user that will be added as friend
        const user2 = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData2,
        );

        // Create user that will be added as friend
        const user3 = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData3,
        );

        // Create user first
        // Must be done after user2 is created for correct bearer token
        const user1 = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData,
        );

        // Add user2 as friend of user1
        await prisma.user.update({
          where: { id: user1.id },
          data: {
            friends: {
              create: [{ intraId: user2.intraId, avatar: user2.avatar }],
            },
          },
        });

        await pactum
          .spec()
          .post(`/friends/${user3.intraId}`)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200)
          .expectJsonLike({
            created: 1,
            data: {
              id: user1.id,
              intraId: user1.intraId,
              friends: [
                { intraId: user2.intraId, avatar: user2.avatar },
                { intraId: user3.intraId, avatar: user3.avatar },
              ],
            },
          });

        const { friends: updatedUserFriends } = await prisma.user.findUnique({
          where: { id: user1.id },
          include: {
            friends: true,
          },
        });

        expect(updatedUserFriends).toHaveLength(2);
      });

      test('it should return 400 if friend is not found', async () => {
        // Create user first
        const user1 = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData,
        );

        await pactum
          .spec()
          .post(`/friends/123456`)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(400);

        const { friends: updatedUserFriends } = await prisma.user.findUnique({
          where: { id: user1.id },
          include: {
            friends: true,
          },
        });

        expect(updatedUserFriends).toHaveLength(0);
      });

      test('it should return 400 if friend is user themselves', async () => {
        // Create user first
        const user1 = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData,
        );

        await pactum
          .spec()
          .post(`/friends/${user1.intraId}`)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(400);

        const { friends: updatedUserFriends } = await prisma.user.findUnique({
          where: { id: user1.id },
          include: {
            friends: true,
          },
        });

        expect(updatedUserFriends).toHaveLength(0);
      });

      test('it should return 409 if friend was already added', async () => {
        // Create user that will be added as friend
        const user2 = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData2,
        );

        // Create user first
        // Must be done after user2 is created for correct bearer token
        const user1 = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData,
        );

        // Add user2 as friend of user1
        await prisma.user.update({
          where: { id: user1.id },
          data: {
            friends: {
              create: [{ intraId: user2.intraId, avatar: user2.avatar }],
            },
          },
        });

        await pactum
          .spec()
          .post(`/friends/${user2}`)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(400);

        const { friends: updatedUserFriends } = await prisma.user.findUnique({
          where: { id: user1.id },
          include: {
            friends: true,
          },
        });

        expect(updatedUserFriends).toHaveLength(1);
      });

      test('it should return 400 if friend id is not a valid number', async () => {
        // Create user first
        const user1 = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData,
        );

        await pactum
          .spec()
          .post(`/friends/${NaN}`)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(400);

        const { friends: updatedUserFriends } = await prisma.user.findUnique({
          where: { id: user1.id },
          include: {
            friends: true,
          },
        });

        expect(updatedUserFriends).toHaveLength(0);
      });

      test('it should return 401 if user is not authenticated', async () => {
        await pactum.spec().post(`/friends/123456`).expectStatus(401);
      });
    });

    describe('get', () => {
      test('it should return friends of specified user', async () => {
        const user = await createUserWithFriends(
          prisma,
          intraService,
          intraUserToken,
          userData,
          [userData2, userData3],
        );

        await pactum
          .spec()
          .get(`/friends/${user.intraId}`)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200)
          .expectJsonLike({
            found: 2,
            data: {
              id: user.id,
              intraId: user.intraId,
              friends: [
                { intraId: userData2.intraId, avatar: userData2.avatar },
                { intraId: userData3.intraId, avatar: userData3.avatar },
              ],
            },
          });
      });

      test('it should return friends of current user', async () => {
        const user = await createUserWithFriends(
          prisma,
          intraService,
          intraUserToken,
          userData,
          [userData2, userData3],
        );

        await pactum
          .spec()
          .get('/friends/')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200)
          .expectJsonLike({
            found: 2,
            data: {
              id: user.id,
              intraId: user.intraId,
              friends: [
                { intraId: userData2.intraId, avatar: userData2.avatar },
                { intraId: userData3.intraId, avatar: userData3.avatar },
              ],
            },
          });
      });

      test('it should return 400 if specified user does not exist', async () => {
        // Create user first
        await createUser(prisma, intraService, intraUserToken, userData);

        await pactum
          .spec()
          .get(`/friends/${NaN}}`)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(400);
      });

      test('it should return 401 if user is not authenticated', async () => {
        await pactum.spec().get('/friends/').expectStatus(401);
      });
    });

    describe('delete', () => {
      test('it should delete a friend', async () => {
        const user = await createUserWithFriends(
          prisma,
          intraService,
          intraUserToken,
          userData,
          [userData2, userData3],
        );

        await pactum
          .spec()
          .delete(`/friends/${userData2.intraId}`)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200)
          .expectJsonLike({
            deleted: 1,
            data: {
              id: user.id,
              intraId: user.intraId,
              friends: [
                { intraId: userData3.intraId, avatar: userData3.avatar },
              ],
            },
          });

        const { friends: remainingFriends } = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            friends: true,
          },
        });

        expect(remainingFriends.length).toEqual(1);
      });

      test('it should return 400 if friendId is not valid', async () => {
        const user = await createUserWithFriends(
          prisma,
          intraService,
          intraUserToken,
          userData,
          [userData2, userData3],
        );

        await pactum
          .spec()
          .delete(`/friends/${NaN}`)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(400);

        const { friends: remainingFriends } = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            friends: true,
          },
        });

        expect(remainingFriends.length).toEqual(2);
      });

      test('it should return 400 if friendId is not found', async () => {
        const user = await createUserWithFriends(
          prisma,
          intraService,
          intraUserToken,
          userData,
          [userData2],
        );

        await pactum
          .spec()
          .delete(`/friends/${userData3.intraId}`)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(400);

        const { friends: remainingFriends } = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            friends: true,
          },
        });

        expect(remainingFriends.length).toEqual(1);
      });

      test('it should return 401 if user is not authenticated', async () => {
        await pactum
          .spec()
          .delete(`/friends/${userData.intraId}`)
          .expectStatus(401);
      });
    });
  });

  describe('Game', () => {
    const uuidRegex =
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

    const ball = {
      x: 10 / 2,
      y: 10 / 2,
      radius: 10,
      velocityX: 5,
      velocityY: 5,
      speed: 20,
      color: 'WHITE',
      reset: false,
    };

    const player1 = {
      x: 30,
      y: 100,
      width: 10,
      height: 100,
      score: 0,
      color: 'WHITE',
      index: 0,
    };

    const player2 = {
      x: 120,
      y: 10,
      width: 10,
      height: 100,
      score: 200,
      color: 'WHITE',
      index: 1,
    };

    describe('sessions', () => {
      describe('new', () => {
        it('should create a new session', async () => {
          await pactum
            .spec()
            .post('/game/sessions/new')
            .withBody({
              ball: JSON.stringify(ball),
              player1: JSON.stringify(player1),
              player2: JSON.stringify(player2),
            })
            .expectStatus(201)
            .expectJsonLike({
              created: 1,
              data: {
                id: uuidRegex,
                ball,
                players: [player1, player2],
              },
            });

          const sessions = await prisma.gameSession.findMany({
            include: {
              ball: true,
              players: true,
            },
          });
          expect(sessions).toHaveLength(1);

          const createdSession = sessions[0];
          expect(createdSession.ball).toMatchObject(ball);
          expect(createdSession.players).toHaveLength(2);
        });

        it('should return 400 if second player is not provided', async () => {
          await pactum
            .spec()
            .post('/game/sessions/new')
            .withBody({
              ball: JSON.stringify(ball),
              player1: JSON.stringify(player1),
            })
            .expectStatus(400);
        });

        it('should return 400 if session data is not valid JSON', async () => {
          await pactum
            .spec()
            .post('/game/sessions/new')
            .withBody({
              ball: ball,
              player1: player1,
              player2: player2,
            })
            .expectStatus(400);
        });
      });

      describe('get', () => {
        it('should return an existing session', async () => {
          const session = await createGameSession(
            prisma,
            ball,
            player1,
            player2,
          );

          await pactum
            .spec()
            .get(`/game/sessions/${session.id}`)
            .expectStatus(200)
            .expectJsonLike({
              found: 1,
              data: {
                id: uuidRegex,
                ball,
                players: [player1, player2],
              },
            });
        });

        it("should return 404 if session doesn't exist", async () => {
          await pactum
            .spec()
            .get(`/game/sessions/${Math.random()}`)
            .expectStatus(404);
        });
      });

      describe('put', () => {
        const newBall = {
          ...ball,
          radius: 66,
        };

        const newPlayer1 = {
          ...player1,
          width: 42,
        };

        const newPlayer2 = {
          ...player2,
          width: 7,
        };

        it('should update an existing session', async () => {
          const session = await createGameSession(
            prisma,
            ball,
            player1,
            player2,
          );

          await pactum
            .spec()
            .put(`/game/sessions/${session.id}`)
            .withBody({
              ball: JSON.stringify(newBall),
              player1: JSON.stringify(newPlayer1),
              player2: JSON.stringify(newPlayer2),
            })
            .expectStatus(200)
            .expectJsonLike({
              updated: 1,
              data: {
                id: uuidRegex,
                ball,
                players: [player1, player2],
              },
            });

          const sessionData = await prisma.gameSession.findUnique({
            where: { id: session.id },
            include: {
              ball: true,
              players: true,
            },
          });

          expect(sessionData.ball).toMatchObject(newBall);
          expect(sessionData.players[0]).toMatchObject(newPlayer1);
          expect(sessionData.players[1]).toMatchObject(newPlayer2);
        });

        it("should return 404 if session doesn't exist", async () => {
          await pactum
            .spec()
            .put(`/game/sessions/${Math.random()}`)
            .withBody({
              ball: JSON.stringify(ball),
              player1: JSON.stringify(player1),
              player2: JSON.stringify(player2),
            })
            .expectStatus(404);
        });

        it('should return 400 if session data is not valid JSON', async () => {
          const session = await createGameSession(
            prisma,
            ball,
            player1,
            player2,
          );

          await pactum
            .spec()
            .put(`/game/sessions/${session.id}`)
            .withBody({
              ball: newBall,
              player1: newPlayer1,
              player2: newPlayer2,
            })
            .expectStatus(400);

          const sessionData = await prisma.gameSession.findUnique({
            where: { id: session.id },
            include: {
              ball: true,
              players: true,
            },
          });

          expect(sessionData.ball).toMatchObject(session.ball);
          expect(sessionData.players[0]).toMatchObject(session.players[0]);
          expect(sessionData.players[1]).toMatchObject(session.players[1]);
        });
      });
    });
  });
});
