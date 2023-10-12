import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { IntraService } from '../src/intra/intra.service';
import * as pactum from 'pactum';
import {
  createSocketClient,
  createGameSession,
  createUser,
  createUserWithFriends,
  disconnectSockets,
} from './test.utils';
import * as fs from 'fs';
import { TwoFactorAuthService } from '../src/two-factor-auth/two-factor-auth.service';
import { testUserData } from '../config/app.constants';
import { User } from '@prisma/client';
import { IntraUserDataDto } from 'src/auth/dto/intra-user-data.dto';
import { Socket } from 'socket.io-client';
import {
  baseUrl,
  port,
  userData,
  userData2,
  userData3,
  testAvatarPath,
  intraUserToken,
  uuidRegex,
} from './test.constants';
import path = require('path');
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let intraService: IntraService;
  let twoFactorAuthService: TwoFactorAuthService;
  let cacheManagerService: any;

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
    cacheManagerService = app.get(CACHE_MANAGER);
    pactum.request.setBaseUrl(baseUrl);
  });

  beforeEach(async () => {
    await prisma.cleanDb();
  });

  afterEach(async () => {
    jest.resetAllMocks();

    if (fs.existsSync(testAvatarPath)) {
      fs.readdir(testAvatarPath, (err, files) => {
        if (err) {
          console.error(err);
        }

        files.forEach((file) => {
          const fileDir = path.join(testAvatarPath, file);

          if (file !== '.gitkeep') {
            fs.unlinkSync(fileDir);
          }
        });
      });
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('Auth', () => {
    describe('signin', () => {
      it('should sign up user', async () => {
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
        await createUser(prisma, intraService, intraUserToken, userData);

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
            data: { ...userData, isTwoFactorAuthEnabled: true },
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
        await createUser(prisma, intraService, intraUserToken, testUserData);

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
        await createUser(prisma, intraService, intraUserToken, testUserData);

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
            id: user.id,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            data: {
              avatar: user.avatar,
              email: user.email,
              intraId: user.intraId,
              isTwoFactorAuthEnabled: user.isTwoFactorAuthEnabled,
              username: user.username,
            },
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
            username: newUsername,
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

      it('should return 400 if username contains forbidden characters', async () => {
        const newUsername = 'username!';

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

      it('should return 400 if username is not unique', async () => {
        // Create user first
        const user1 = await createUser(
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
            username: user1.username,
          })
          .expectStatus(400)
          .expectJsonLike({
            message: ['Provide a new username'],
            error: 'Bad Request',
            statusCode: 400,
          });

        const notUpdatedUser1 = await prisma.user.findUnique({
          where: { id: user1.id },
        });
        expect(notUpdatedUser1.username).toBe(user1.username);
      });

      it('should return 400 if username is not unique', async () => {
        const newUsername = 'new-username';

        // Create user first
        await createUser(prisma, intraService, intraUserToken, userData);

        await pactum
          .spec()
          .patch(`/users/username`)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody({
            username: newUsername,
          })
          .expectStatus(200);

        const user2 = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData2,
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
          .expectStatus(400)
          .expectJsonLike({
            message: ['Username already exists'],
            error: 'Bad Request',
            statusCode: 400,
          });

        const notUpdatedUser2 = await prisma.user.findUnique({
          where: { id: user2.id },
        });

        expect(notUpdatedUser2.username).toBe(userData2.username);
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

        const avatarRegex = new RegExp(
          `^.*${user.username.toLowerCase()}\_\\d+\.png$`,
        );

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
              avatar: avatarRegex,
            },
          });

        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        expect(updatedUser.avatar).toMatch(avatarRegex);

        const filesExists = fs
          .readdirSync(testAvatarPath)
          .some((file) => file.match(avatarRegex));
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
        const avatarRegex = new RegExp(
          `^.*${userData.username.toLowerCase()}\_\\d+\.png$`,
        );
        const filesExists = fs
          .readdirSync(testAvatarPath)
          .some((file) => file.match(avatarRegex));
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
        const avatarRegex = new RegExp(
          `^.*${userData.username.toLowerCase()}\_\\d+\.png$`,
        );
        const filesExists = fs
          .readdirSync(testAvatarPath)
          .some((file) => file.match(avatarRegex));
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
        const avatarRegex = new RegExp(
          `^.*${userData.username.toLowerCase()}\_\\d+\.png$`,
        );
        const filesExists = fs
          .readdirSync(testAvatarPath)
          .some((file) => file.match(avatarRegex));
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
        const avatarRegex = new RegExp(
          `^.*${updatedUser.username.toLowerCase()}\_\\d+\.png$`,
        );
        const filesExists = fs
          .readdirSync(testAvatarPath)
          .some((file) => file.match(avatarRegex));
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

        const { friends: friendUserFriends } = await prisma.user.findUnique({
          where: { id: user2.id },
          include: {
            friends: true,
          },
        });
        expect(friendUserFriends).toHaveLength(1);
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
        const user1 = await createUserWithFriends(
          prisma,
          intraService,
          intraUserToken,
          userData,
          [userData2],
        );

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
                {
                  userId: uuidRegex,
                  intraId: user2.intraId,
                  avatar: user2.avatar,
                  email: user2.email,
                  username: user2.username,
                },
                {
                  userId: uuidRegex,
                  intraId: user3.intraId,
                  avatar: user3.avatar,
                  email: user3.email,
                  username: user3.username,
                },
              ],
            },
          });

        // User has 2 friends
        const { friends: updatedUserFriends } = await prisma.user.findUnique({
          where: { id: user1.id },
          include: {
            friends: true,
          },
        });
        expect(updatedUserFriends).toHaveLength(2);

        // User 2 has 1 friend
        const { friends: user2Friends } = await prisma.user.findUnique({
          where: { id: user2.id },
          include: {
            friends: true,
          },
        });
        expect(user2Friends).toHaveLength(1);

        // User 3 has 1 friend
        const { friends: user3Friends } = await prisma.user.findUnique({
          where: { id: user2.id },
          include: {
            friends: true,
          },
        });
        expect(user3Friends).toHaveLength(1);
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
              create: [
                {
                  intraId: user2.intraId,
                  avatar: user2.avatar,
                  email: user2.email,
                  username: user2.username,
                },
              ],
            },
          },
        });

        await pactum
          .spec()
          .post(`/friends/${user2.intraId}`)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(409)
          .expectBody({
            message: 'Friend already added',
            error: 'Conflict',
            statusCode: 409,
          });

        // User has 1 friend
        const { friends: updatedUserFriends } = await prisma.user.findUnique({
          where: { id: user1.id },
          include: {
            friends: true,
          },
        });
        expect(updatedUserFriends).toHaveLength(1);
      });

      test('it should return 400 if friendId is not a valid number', async () => {
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
        await createUserWithFriends(
          prisma,
          intraService,
          intraUserToken,
          userData,
          [userData2],
        );

        await pactum
          .spec()
          .get(`/friends/${userData3.intraId}}`)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(400);
      });

      test('it should return 400 if user ID is not valid', async () => {
        await createUserWithFriends(
          prisma,
          intraService,
          intraUserToken,
          userData,
          [userData2],
        );

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
        const user2 = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData2,
        );

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
              friends: [{ intraId: userData3.intraId }],
            },
          });

        const { friends: remainingFriends } = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            friends: true,
          },
        });
        expect(remainingFriends.length).toEqual(1);

        const { friends: unfriendedUserFriends } = await prisma.user.findUnique(
          {
            where: { id: user2.id },
            include: {
              friends: true,
            },
          },
        );
        expect(unfriendedUserFriends.length).toEqual(0);
      });

      test('it should delete two friends', async () => {
        const user2 = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData2,
        );

        const user3 = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData3,
        );

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
              friends: [{ intraId: userData3.intraId }],
            },
          });

        await pactum
          .spec()
          .delete(`/friends/${userData3.intraId}`)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200)
          .expectJsonLike({
            deleted: 1,
            data: {
              id: user.id,
              intraId: user.intraId,
              friends: [],
            },
          });

        const { friends: remainingFriends } = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            friends: true,
          },
        });
        expect(remainingFriends.length).toEqual(0);

        const { friends: user2Friends } = await prisma.user.findUnique({
          where: { id: user2.id },
          include: {
            friends: true,
          },
        });
        expect(user2Friends.length).toEqual(0);

        const { friends: user3Friends } = await prisma.user.findUnique({
          where: { id: user3.id },
          include: {
            friends: true,
          },
        });
        expect(user3Friends.length).toEqual(0);
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
          await createUser(prisma, intraService, intraUserToken, userData);

          await pactum
            .spec()
            .post('/game/sessions')
            .withHeaders({ Authorization: 'Bearer $S{userAt}' })
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
          await createUser(prisma, intraService, intraUserToken, userData);

          await pactum
            .spec()
            .post('/game/sessions')
            .withHeaders({ Authorization: 'Bearer $S{userAt}' })
            .withBody({
              ball: JSON.stringify(ball),
              player1: JSON.stringify(player1),
            })
            .expectStatus(400);
        });

        it('should return 400 if session data is not valid JSON', async () => {
          await createUser(prisma, intraService, intraUserToken, userData);

          await pactum
            .spec()
            .post('/game/sessions')
            .withHeaders({ Authorization: 'Bearer $S{userAt}' })
            .withBody({
              ball: ball,
              player1: player1,
              player2: player2,
            })
            .expectStatus(400);
        });

        it('should return 401 if user is not authenticated', async () => {
          await pactum
            .spec()
            .post('/game/sessions')
            .withBody({
              ball: ball,
              player1: player1,
              player2: player2,
            })
            .expectStatus(401)
            .expectJson({
              message: 'Unauthorized',
              statusCode: 401,
            });
        });
      });

      describe('get', () => {
        it('should return an existing session', async () => {
          await createUser(prisma, intraService, intraUserToken, userData);

          const session = await createGameSession(
            prisma,
            ball,
            player1,
            player2,
          );

          await pactum
            .spec()
            .get(`/game/sessions/${session.id}`)
            .withHeaders({ Authorization: 'Bearer $S{userAt}' })
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
          await createUser(prisma, intraService, intraUserToken, userData);

          await pactum
            .spec()
            .get(`/game/sessions/${Math.random()}`)
            .withHeaders({ Authorization: 'Bearer $S{userAt}' })
            .expectStatus(404);
        });

        it('should return 401 if user is not authenticated', async () => {
          await pactum
            .spec()
            .get(`/game/sessions/any-session`)
            .expectStatus(401)
            .expectJson({
              message: 'Unauthorized',
              statusCode: 401,
            });
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
          await createUser(prisma, intraService, intraUserToken, userData);

          const session = await createGameSession(
            prisma,
            ball,
            player1,
            player2,
          );

          await pactum
            .spec()
            .put(`/game/sessions/${session.id}`)
            .withHeaders({ Authorization: 'Bearer $S{userAt}' })
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
          await createUser(prisma, intraService, intraUserToken, userData);

          await pactum
            .spec()
            .put(`/game/sessions/${Math.random()}`)
            .withHeaders({ Authorization: 'Bearer $S{userAt}' })
            .withBody({
              ball: JSON.stringify(ball),
              player1: JSON.stringify(player1),
              player2: JSON.stringify(player2),
            })
            .expectStatus(404);
        });

        it('should return 400 if session data is not valid JSON', async () => {
          await createUser(prisma, intraService, intraUserToken, userData);

          const session = await createGameSession(
            prisma,
            ball,
            player1,
            player2,
          );

          await pactum
            .spec()
            .put(`/game/sessions/${session.id}`)
            .withHeaders({ Authorization: 'Bearer $S{userAt}' })
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

        it('should return 401 if user is not authenticated', async () => {
          await createUser(prisma, intraService, intraUserToken, userData);

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
            .expectStatus(401)
            .expectJson({
              message: 'Unauthorized',
              statusCode: 401,
            });
        });
      });
    });

    describe('game data', () => {
      describe('new', () => {
        const baseGameData = {
          gameDataId: '95130ad8-ffaf-4c7f-84c2-68ae2d020306',
          startedAt: '2023-10-11T20:32:33.610Z',
          elapsedTime: 26237,
        };

        test('should create a new game data set from 2 API calls', async () => {
          const user1 = await createUser(
            prisma,
            intraService,
            intraUserToken,
            userData,
          );

          const user1GameDataSetBaseData = {
            score: 5,
            isWinner: true,
          };

          await pactum
            .spec()
            .post('/game/data')
            .withHeaders({ Authorization: 'Bearer $S{userAt}' })
            .withBody({
              ...baseGameData,
              player: {
                intraId: user1.intraId,
                avatar: user1.avatar,
                username: user1.username,
                ...user1GameDataSetBaseData,
              },
            })
            .expectStatus(201)
            .expectJsonLike({
              created: 1,
              data: {
                sessionId: baseGameData.gameDataId,
                id: uuidRegex,
                startedAt: baseGameData.startedAt,
                elapsedTime: baseGameData.elapsedTime,
                players: [
                  {
                    id: uuidRegex,
                    intraId: user1.intraId,
                    avatar: user1.avatar,
                    username: user1.username,
                    ...user1GameDataSetBaseData,
                  },
                ],
              },
            });

          const user2 = await createUser(
            prisma,
            intraService,
            intraUserToken,
            userData2,
          );

          const user2GameDataSetBaseData = {
            score: 4,
            isWinner: false,
          };

          await pactum
            .spec()
            .post('/game/data')
            .withHeaders({ Authorization: 'Bearer $S{userAt}' })
            .withBody({
              ...baseGameData,
              player: {
                intraId: user2.intraId,
                avatar: user2.avatar,
                username: user2.username,
                ...user2GameDataSetBaseData,
              },
            })
            .expectStatus(201)
            .expectJsonLike({
              created: 0,
              data: {
                sessionId: baseGameData.gameDataId,
                id: uuidRegex,
                startedAt: baseGameData.startedAt,
                elapsedTime: baseGameData.elapsedTime,
                players: [
                  {
                    id: uuidRegex,
                    intraId: user1.intraId,
                    avatar: user1.avatar,
                    username: user1.username,
                    ...user1GameDataSetBaseData,
                  },
                  {
                    id: uuidRegex,
                    intraId: user2.intraId,
                    avatar: user2.avatar,
                    username: user2.username,
                    ...user2GameDataSetBaseData,
                  },
                ],
              },
            });

          const gameDataSets = await prisma.gameDataSet.findMany({});

          expect(gameDataSets).toHaveLength(1);
          expect(gameDataSets[0]).toMatchObject({
            elapsedTime: baseGameData.elapsedTime,
            id: gameDataSets[0].id,
            sessionId: baseGameData.gameDataId,
            startedAt: new Date(baseGameData.startedAt),
          });
        });

        test('it should return 401 if user is not authenticated', async () => {
          const user1GameDataSetBaseData = {
            score: 5,
            isWinner: true,
          };

          await pactum
            .spec()
            .post('/game/data')
            .withBody({
              ...baseGameData,
              player: {
                intraId: userData.intraId,
                avatar: userData.avatar,
                username: userData.username,
                ...user1GameDataSetBaseData,
              },
            })
            .expectStatus(401)
            .expectJson({
              message: 'Unauthorized',
              statusCode: 401,
            });
        });
      });
    });
  });

  describe('Sockets', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let user1: User, user2: User, user3: User;

    describe('matchmaking', () => {
      const MATCHMAKING_ENDPOINT = 'matchmaking';

      beforeEach(async () => {
        user1 = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData,
        );

        user2 = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData2,
        );

        user3 = await createUser(
          prisma,
          intraService,
          intraUserToken,
          userData3,
        );
        cacheManagerService.reset();
      });

      it('should emit userJoined event on newUser', (done) => {
        expect.assertions(3);

        createUser(prisma, intraService, intraUserToken, userData).then(
          (user: User) => {
            const socket = createSocketClient(app, MATCHMAKING_ENDPOINT);

            socket.on('connect', async () => {
              socket.emit('newUser', JSON.stringify({ intraId: user.intraId }));
            });

            socket.on(`userJoined/${user.intraId}`, (data) => {
              expect(data).toStrictEqual({
                queued: true,
              });

              socket.disconnect();

              cacheManagerService.get('queue').then((queue) => {
                expect(queue).toHaveLength(1);

                prisma.userGameSession.findMany().then((userGameSessions) => {
                  expect(userGameSessions).toHaveLength(0);
                  done();
                });
              });
            });
          },
        );
      });

      it('should create 1 game session when 2 users are queued', (done) => {
        expect.assertions(10);

        Promise.allSettled([
          createUser(prisma, intraService, intraUserToken, userData),
          createUser(prisma, intraService, intraUserToken, userData2),
        ]).then((users) => {
          const allUsers: IntraUserDataDto[] = users
            .filter((result) => result.status === 'fulfilled')
            .map((result: any) => result.value);

          const allSockets: Socket[] = [
            createSocketClient(app, MATCHMAKING_ENDPOINT),
            createSocketClient(app, MATCHMAKING_ENDPOINT),
          ];

          allSockets.forEach((socket, i) => {
            // Connecting users
            socket.on('connect', async () => {
              socket.emit(
                'newUser',
                JSON.stringify({ intraId: allUsers[i].intraId }),
              );
            });

            // Users joined
            socket.on(`userJoined/${allUsers[i].intraId}`, (data) => {
              expect(data).toStrictEqual({
                queued: true,
              });
            });

            // New session created for both users
            socket.on(`newSession/${allUsers[i].intraId}`, async (data) => {
              const sessionData = data.data;

              expect(sessionData.players).toHaveLength(2);
              expect(sessionData.players[0]).toHaveProperty(
                'intraId',
                userData.intraId,
              );
              expect(sessionData.players[1]).toHaveProperty(
                'intraId',
                userData2.intraId,
              );

              if (allUsers[i].intraId === userData2.intraId) {
                disconnectSockets(allSockets);

                cacheManagerService.get('queue').then((queue) => {
                  expect(queue).toHaveLength(0);

                  prisma.userGameSession.findMany().then((userGameSessions) => {
                    expect(userGameSessions).toHaveLength(1);
                    done();
                  });
                });
              }
            });
          });
        });
      });

      it('should remove user from queue when they disconnect', (done) => {
        expect.assertions(11);

        // Create and disconnect first user
        new Promise((resolve) => {
          createUser(prisma, intraService, intraUserToken, userData).then(
            (user) => {
              const socket = createSocketClient(app, MATCHMAKING_ENDPOINT);

              socket.on('connect', async () => {
                socket.emit(
                  'newUser',
                  JSON.stringify({ intraId: user.intraId }),
                );
              });

              socket.on(`userJoined/${user.intraId}`, (data) => {
                expect(data).toStrictEqual({
                  queued: true,
                });

                socket.disconnect();
                resolve(undefined);
              });
            },
          );
        }).then(() => {
          Promise.allSettled([
            createUser(prisma, intraService, intraUserToken, userData2),
            createUser(prisma, intraService, intraUserToken, userData3),
          ]).then((users) => {
            const allUsers: IntraUserDataDto[] = users
              .filter((result) => result.status === 'fulfilled')
              .map((result: any) => result.value);

            const allSockets = [
              createSocketClient(app, MATCHMAKING_ENDPOINT),
              createSocketClient(app, MATCHMAKING_ENDPOINT),
            ];

            allSockets.forEach((socket, i) => {
              const user = allUsers[i];

              socket.on('connect', async () => {
                socket.emit(
                  'newUser',
                  JSON.stringify({ intraId: user.intraId }),
                );
              });

              socket.on(`userJoined/${user.intraId}`, (data) => {
                expect(data).toStrictEqual({
                  queued: true,
                });
              });

              socket.on(`newSession/${user.intraId}`, async (data) => {
                const sessionData = data.data;

                expect(sessionData.players).toHaveLength(2);
                expect(sessionData.players[0]).toHaveProperty(
                  'intraId',
                  userData2.intraId,
                );
                expect(sessionData.players[1]).toHaveProperty(
                  'intraId',
                  userData3.intraId,
                );

                if (user.intraId === user3.intraId) {
                  disconnectSockets(allSockets);

                  cacheManagerService.get('queue').then((queue) => {
                    expect(queue).toHaveLength(0);

                    prisma.userGameSession
                      .findMany()
                      .then((userGameSessions) => {
                        expect(userGameSessions).toHaveLength(1);
                        done();
                      });
                  });
                }
              });
            });
          });
        });
      });

      it('should emit unqueuedUser and remove user from queue on unqueueUser', (done) => {
        expect.assertions(4);

        createUser(prisma, intraService, intraUserToken, userData).then(
          (user: User) => {
            const socket = createSocketClient(app, MATCHMAKING_ENDPOINT);

            socket.on('connect', async () => {
              socket.emit('newUser', JSON.stringify({ intraId: user.intraId }));
            });

            socket.on(`unqueuedUser/${user.intraId}`, (data) => {
              expect(data).toStrictEqual({
                queued: false,
              });

              socket.disconnect();

              cacheManagerService.get('queue').then((queue) => {
                expect(queue).toHaveLength(0);

                prisma.userGameSession.findMany().then((userGameSessions) => {
                  expect(userGameSessions).toHaveLength(0);
                  done();
                });
              });
            });

            socket.on(`userJoined/${user.intraId}`, (data) => {
              expect(data).toStrictEqual({
                queued: true,
              });

              socket.emit(
                'unqueueUser',
                JSON.stringify({ intraId: user.intraId }),
              );
            });
          },
        );
      });

      it('should emit error if intraId is not valid number', (done) => {
        expect.assertions(3);

        const invalidIntraId = 'invalid';
        const socket = createSocketClient(app, MATCHMAKING_ENDPOINT);

        socket.on('connect', async () => {
          socket.emit('newUser', JSON.stringify({ intraId: invalidIntraId }));
        });

        socket.on(`userJoined/${invalidIntraId}`, (data) => {
          expect(data).toStrictEqual({
            queued: false,
            message: 'Invalid intraId',
          });

          socket.disconnect();

          cacheManagerService.get('queue').then((queue) => {
            expect(queue).toBe(undefined);

            prisma.userGameSession.findMany().then((userGameSessions) => {
              expect(userGameSessions).toHaveLength(0);
              done();
            });
          });
        });
      });

      it('should emit error if user is not found', (done) => {
        expect.assertions(3);

        const unsignedUserIntraId = 6666;
        const socket = createSocketClient(app, MATCHMAKING_ENDPOINT);

        socket.on('connect', async () => {
          socket.emit(
            'newUser',
            JSON.stringify({ intraId: unsignedUserIntraId }),
          );
        });

        socket.on(`userJoined/${unsignedUserIntraId}`, (data) => {
          expect(data).toStrictEqual({
            queued: false,
            message: 'User not found',
          });

          socket.disconnect();

          cacheManagerService.get('queue').then((queue) => {
            expect(queue).toBe(undefined);

            prisma.userGameSession.findMany().then((userGameSessions) => {
              expect(userGameSessions).toHaveLength(0);
              done();
            });
          });
        });
      });

      it('should emit error if user is already queued', (done) => {
        expect.assertions(4);

        createUser(prisma, intraService, intraUserToken, userData).then(
          (user) => {
            let isUserQueued = false;
            const socket = createSocketClient(app, MATCHMAKING_ENDPOINT);

            socket.on('connect', async () => {
              socket.emit('newUser', JSON.stringify({ intraId: user.intraId }));
            });

            socket.on(`userJoined/${user.intraId}`, (data) => {
              if (!isUserQueued) {
                expect(data).toStrictEqual({
                  queued: true,
                });

                isUserQueued = true;
                socket.emit(
                  'newUser',
                  JSON.stringify({ intraId: user.intraId }),
                );
              } else {
                expect(data).toStrictEqual({
                  queued: true,
                  message: 'Already queued',
                });

                socket.disconnect();

                cacheManagerService.get('queue').then((queue) => {
                  expect(queue).toHaveLength(1);

                  prisma.userGameSession.findMany().then((userGameSessions) => {
                    expect(userGameSessions).toHaveLength(0);
                    done();
                  });
                });
              }
            });
          },
        );
      });
    });

    describe('game data', () => {
      const GAME_DATA_ENDPOINT = 'game-data';

      const dataSetUser1 = {
        gameDataId: 1111,
        ball: {},
        user1: {},
      };

      const dataSetInitial = {
        gameDataId: 1111,
        ball: {},
        user1: {},
        user2: {},
      };

      const updatedDataSetBothUser = {
        ...dataSetUser1,
        ball: {
          updated: true,
        },
      };

      beforeEach(async () => {
        await cacheManagerService.reset();
      });

      describe('ready', () => {
        it('should not emit allOpponentsReady when only user1 is ready', (done) => {
          expect.assertions(0);

          const socket = createSocketClient(app, GAME_DATA_ENDPOINT);

          socket.on('connect', () => {
            socket.emit('startGame', JSON.stringify(dataSetInitial));
          });

          socket.on(`gameDataCreated/${dataSetInitial.gameDataId}`, () => {
            socket.emit(
              'ready',
              JSON.stringify({
                gameDataId: dataSetInitial.gameDataId,
                isUser1: true,
              }),
            );
          });

          socket.on(`allOpponentsReady/${dataSetInitial.gameDataId}`, () => {
            done('allOpponentsReady should not be emitted');
          });

          socket.on(`awaitingOpponent/${dataSetInitial.gameDataId}`, () => {
            socket.emit('deleteGameSet', JSON.stringify(dataSetInitial));

            socket.on(`gameSetDeleted/${dataSetInitial.gameDataId}`, () => {
              socket.disconnect();

              done();
            });
          });
        });

        it('should not emit allOpponentsReady when only user2 is ready', (done) => {
          expect.assertions(0);

          const socket = createSocketClient(app, GAME_DATA_ENDPOINT);

          socket.on('connect', () => {
            socket.emit('startGame', JSON.stringify(dataSetInitial));
          });

          socket.on(`gameDataCreated/${dataSetInitial.gameDataId}`, () => {
            socket.emit(
              'ready',
              JSON.stringify({
                gameDataId: dataSetInitial.gameDataId,
                isUser1: false,
              }),
            );
          });

          socket.on(`allOpponentsReady/${dataSetInitial.gameDataId}`, () => {
            done('allOpponentsReady should not be emitted');
          });

          socket.on(`awaitingOpponent/${dataSetInitial.gameDataId}`, () => {
            socket.emit('deleteGameSet', JSON.stringify(dataSetInitial));

            socket.on(`gameSetDeleted/${dataSetInitial.gameDataId}`, () => {
              socket.disconnect();

              done();
            });
          });
        });

        it('should emit allOpponentsReady when both users are ready', (done) => {
          expect.assertions(0);

          const socket = createSocketClient(app, GAME_DATA_ENDPOINT);

          socket.on('connect', () => {
            socket.emit('startGame', JSON.stringify(dataSetInitial));
          });

          socket.on(`gameDataCreated/${dataSetInitial.gameDataId}`, () => {
            socket.emit(
              'ready',
              JSON.stringify({
                gameDataId: dataSetInitial.gameDataId,
                isUser1: true,
              }),
            );
          });

          socket.on(`allOpponentsReady/${dataSetInitial.gameDataId}`, () => {
            socket.emit('deleteGameSet', JSON.stringify(dataSetInitial));

            socket.on(`gameSetDeleted/${dataSetInitial.gameDataId}`, () => {
              socket.disconnect();

              done();
            });
          });

          socket.on(`awaitingOpponent/${dataSetInitial.gameDataId}`, () => {
            socket.emit(
              'ready',
              JSON.stringify({
                gameDataId: dataSetInitial.gameDataId,
                isUser1: false,
              }),
            );
          });
        });
      });

      describe('startGame', () => {
        describe('when gameDataSet has not been created yet', () => {
          it('should create gameDataSet and emit gameDataCreated when startGame is triggered', (done) => {
            expect.assertions(2);

            const socket = createSocketClient(app, GAME_DATA_ENDPOINT);

            socket.on('connect', () => {
              cacheManagerService.get('gameDataSets').then((gameDataSets) => {
                expect(gameDataSets).toBe(undefined);

                socket.emit('startGame', JSON.stringify(dataSetInitial));
              });
            });

            socket.on(`gameDataCreated/${dataSetInitial.gameDataId}`, () => {
              cacheManagerService.get('gameDataSets').then((gameDataSets) => {
                expect(gameDataSets).toHaveLength(1);

                socket.emit('deleteGameSet', JSON.stringify(dataSetInitial));

                socket.on(`gameSetDeleted/${dataSetInitial.gameDataId}`, () => {
                  socket.disconnect();

                  done();
                });
              });
            });
          });
        });

        describe('when gameDataSet has already been created', () => {
          it('should delete GameDataSet, create another one and emit gameDataCreated when startGame is triggered', (done) => {
            expect.assertions(3);

            const socket = createSocketClient(app, GAME_DATA_ENDPOINT);

            socket.on('connect', () => {
              cacheManagerService.get('gameDataSets').then((gameDataSets) => {
                expect(gameDataSets).toBe(undefined);

                socket.emit('startGame', JSON.stringify(dataSetInitial));
              });
            });

            let isFirstTimeTriggered = true;
            socket.on(`gameDataCreated/${dataSetInitial.gameDataId}`, () => {
              if (isFirstTimeTriggered) {
                isFirstTimeTriggered = false;

                cacheManagerService.get('gameDataSets').then((gameDataSets) => {
                  expect(gameDataSets).toHaveLength(1);
                });

                socket.emit('startGame', JSON.stringify(dataSetInitial));
              } else {
                cacheManagerService.get('gameDataSets').then((gameDataSets) => {
                  expect(gameDataSets).toHaveLength(1);

                  socket.emit('deleteGameSet', JSON.stringify(dataSetInitial));

                  socket.on(
                    `gameSetDeleted/${dataSetInitial.gameDataId}`,
                    () => {
                      socket.disconnect();

                      done();
                    },
                  );
                });
              }
            });
          });
        });
      });

      describe('deleteGameSet', () => {
        describe('when gameDataSet does not exist', () => {
          it('should emit gameSetNotFound without throwing an error', (done) => {
            expect.assertions(2);

            const socket = createSocketClient(app, GAME_DATA_ENDPOINT);

            socket.on('connect', () => {
              cacheManagerService.get('gameDataSets').then((gameDataSets) => {
                expect(gameDataSets).toBe(undefined);

                socket.emit(
                  'deleteGameSet',
                  JSON.stringify({ gameDataId: dataSetInitial.gameDataId }),
                );
              });
            });

            socket.on(`gameSetNotFound/${dataSetInitial.gameDataId}`, () => {
              cacheManagerService.get('gameDataSets').then((gameDataSets) => {
                expect(gameDataSets).toBe(undefined);

                socket.disconnect();
                done();
              });
            });
          });
        });

        describe('when gameDataSet exists', () => {
          it('should emit gameSetDeleted and delete the set', (done) => {
            expect.assertions(3);

            const socket = createSocketClient(app, GAME_DATA_ENDPOINT);

            socket.on('connect', () => {
              cacheManagerService.get('gameDataSets').then((gameDataSets) => {
                expect(gameDataSets).toBe(undefined);

                socket.emit('startGame', JSON.stringify(dataSetInitial));
              });
            });

            socket.on(`gameDataCreated/${dataSetInitial.gameDataId}`, () => {
              cacheManagerService.get('gameDataSets').then((gameDataSets) => {
                expect(gameDataSets).toHaveLength(1);

                socket.emit(
                  'deleteGameSet',
                  JSON.stringify({ gameDataId: dataSetInitial.gameDataId }),
                );
              });
            });

            socket.on(`gameSetDeleted/${dataSetInitial.gameDataId}`, () => {
              cacheManagerService.get('gameDataSets').then((gameDataSets) => {
                expect(gameDataSets).toHaveLength(0);

                socket.disconnect();
                done();
              });
            });
          });
        });
      });

      describe('upload', () => {
        test('should upload data from user1 and emit uploaded event to user1', (done) => {
          expect.assertions(2);

          const socket = createSocketClient(app, GAME_DATA_ENDPOINT);

          // Initialize data set first
          socket.on('connect', () => {
            cacheManagerService.get('gameDataSets').then((gameDataSets) => {
              expect(gameDataSets).toBe(undefined);

              socket.emit('startGame', JSON.stringify(dataSetInitial));
            });
          });

          socket.on(`gameDataCreated/${dataSetInitial.gameDataId}`, () => {
            cacheManagerService.get('gameDataSets').then((gameDataSets) => {
              expect(gameDataSets).toHaveLength(1);

              // Uploading game data
              socket.emit(
                'upload',
                JSON.stringify({
                  ...updatedDataSetBothUser,
                  isUser1: true,
                }),
              );
            });
          });

          socket.on(`uploaded/user2/${dataSetInitial.gameDataId}`, () => {
            done('uploaded/user2 should not be emitted');
          });

          socket.on(`uploaded/user1/${dataSetInitial.gameDataId}`, () => {
            socket.emit('deleteGameSet', JSON.stringify(dataSetInitial));

            socket.on(`gameSetDeleted/${dataSetInitial.gameDataId}`, () => {
              socket.disconnect();

              done();
            });
          });
        });

        test('should upload data from user2 and emit uploaded event to user2', (done) => {
          expect.assertions(2);

          const socket = createSocketClient(app, GAME_DATA_ENDPOINT);

          // Initialize data set first
          socket.on('connect', () => {
            cacheManagerService.get('gameDataSets').then((gameDataSets) => {
              expect(gameDataSets).toBe(undefined);

              socket.emit('startGame', JSON.stringify(dataSetInitial));
            });
          });

          socket.on(`gameDataCreated/${dataSetInitial.gameDataId}`, () => {
            cacheManagerService.get('gameDataSets').then((gameDataSets) => {
              expect(gameDataSets).toHaveLength(1);

              // Uploading game data
              socket.emit(
                'upload',
                JSON.stringify({
                  ...updatedDataSetBothUser,
                  isUser1: false,
                }),
              );
            });
          });

          socket.on(`uploaded/user1/${dataSetInitial.gameDataId}`, () => {
            done('download/user1 should not be emitted');
          });

          socket.on(`uploaded/user2/${dataSetInitial.gameDataId}`, () => {
            socket.emit('deleteGameSet', JSON.stringify(dataSetInitial));

            socket.on(`gameSetDeleted/${dataSetInitial.gameDataId}`, () => {
              socket.disconnect();

              done();
            });
          });
        });
      });

      describe('download', () => {
        test('should received data to be downloaded from user1 and emit downloaded event to user1', (done) => {
          expect.assertions(3);

          const socket = createSocketClient(app, GAME_DATA_ENDPOINT);

          // Initialize data set first
          socket.on('connect', () => {
            cacheManagerService.get('gameDataSets').then((gameDataSets) => {
              expect(gameDataSets).toBe(undefined);

              socket.emit('startGame', JSON.stringify(dataSetInitial));
            });
          });

          socket.on(`gameDataCreated/${dataSetInitial.gameDataId}`, () => {
            cacheManagerService.get('gameDataSets').then((gameDataSets) => {
              expect(gameDataSets).toHaveLength(1);

              socket.emit(
                'download',
                JSON.stringify({
                  isUser1: true,
                  gameDataId: dataSetInitial.gameDataId,
                }),
              );
            });
          });

          socket.on(`downloaded/user2/${dataSetInitial.gameDataId}`, () => {
            done('download/user1 should not be emitted');
          });

          socket.on(`downloaded/user1/${dataSetInitial.gameDataId}`, (data) => {
            const parsedData = JSON.parse(data);
            expect(parsedData).toMatchObject({ user2: {} });

            socket.emit('deleteGameSet', JSON.stringify(dataSetInitial));

            socket.on(`gameSetDeleted/${dataSetInitial.gameDataId}`, () => {
              socket.disconnect();

              done();
            });
          });
        });

        test('should received data to be downloaded from user2 and emit downloaded event to user2', (done) => {
          expect.assertions(3);

          const socket = createSocketClient(app, GAME_DATA_ENDPOINT);

          // Initialize data set first
          socket.on('connect', () => {
            cacheManagerService.get('gameDataSets').then((gameDataSets) => {
              expect(gameDataSets).toBe(undefined);

              socket.emit('startGame', JSON.stringify(dataSetInitial));
            });
          });

          socket.on(`gameDataCreated/${dataSetInitial.gameDataId}`, () => {
            cacheManagerService.get('gameDataSets').then((gameDataSets) => {
              expect(gameDataSets).toHaveLength(1);

              socket.emit(
                'download',
                JSON.stringify({
                  isUser1: false,
                  gameDataId: dataSetInitial.gameDataId,
                }),
              );
            });
          });

          socket.on(`downloaded/user1/${dataSetInitial.gameDataId}`, () => {
            done('download/user1 should not be emitted');
          });

          socket.on(`downloaded/user2/${dataSetInitial.gameDataId}`, (data) => {
            const parsedData = JSON.parse(data);
            expect(parsedData).toMatchObject({ user1: {}, ball: {} });

            socket.emit('deleteGameSet', JSON.stringify(dataSetInitial));

            socket.on(`gameSetDeleted/${dataSetInitial.gameDataId}`, () => {
              socket.disconnect();

              done();
            });
          });
        });
      });

      describe('endGame', () => {
        test('should emit gameEnded/intraId/gameDataId when endGame message is sent', (done) => {
          const socket = createSocketClient(app, GAME_DATA_ENDPOINT);

          const gameDataId = 'f7c9c8d0-0e1f-11ec-9a03-0242ac130003';

          const payloadPlayer1 = {
            gameDataId,
            date: new Date().toString(),
            player: {
              intraId: userData.intraId,
              isWinner: true,
            },
          };

          const payloadPlayer2 = {
            gameDataId,
            date: new Date().toString(),
            player: {
              intraId: userData2.intraId,
              isWinner: false,
            },
          };

          socket.on('connect', () => {
            // Player 1 is ending game
            socket.emit('endGame', JSON.stringify(payloadPlayer1));
          });

          socket.on(`gameEnded/${userData.intraId}/${gameDataId}`, (data) => {
            const parsedData = JSON.parse(data);
            expect(parsedData).toMatchObject(payloadPlayer1);

            // Player 2 is ending game
            socket.emit('endGame', JSON.stringify(payloadPlayer2));
          });

          socket.on(`gameEnded/${userData2.intraId}/${gameDataId}`, (data) => {
            const parsedData = JSON.parse(data);
            expect(parsedData).toMatchObject(payloadPlayer2);

            socket.disconnect();

            done();
          });
        });
      });
    });
  });
});
