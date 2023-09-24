export const swaggerConstants = {
  auth: {
    signin: {
      summary:
        'Sign in user through 42 Intra API. Receives a 42 Intra code as input. Retrieves user data from 42 Intra API and creates a new user in the database if needed.',
      ok: {
        description:
          'Returns user data from database. Either existing or new user.',
      },
      bad: {
        description: 'State value does not match or provided code is invalid.',
      },
      unauthorized: {
        description: 'OTP code is invalid.',
      },
      body: {
        description: 'OTP must be provided only if 2FA is enabled.',
      },
    },
  },
  twofa: {
    generate: {
      summary: 'Generate QR code for 2FA. It can be used to add authenticator.',
      ok: {
        description: 'Returns QR code to add authenticator.',
      },
      unauthorized: {
        description: 'JWT token is invalid or expired.',
      },
    },
    activate: {
      summary: 'Activate 2FA on user profile. Receives OTP code as input.',
      ok: {
        description: 'Returns updated user data.',
      },
      unauthorized: {
        description: 'JWT token is invalid or expired or OTP code is invalid.',
      },
      bad: {
        description: 'OTP code is invalid.',
      },
    },
  },
  users: {
    me: {
      summary: 'Retrieve current user data from database.',
      ok: {
        description: 'Returns user data from database.',
      },
      unauthorized: {
        description: 'JWT token is invalid or expired.',
      },
    },
    username: {
      summary: 'Update username.',
      ok: {
        description: 'Returns updated user data.',
      },
      unauthorized: {
        description: 'JWT token is invalid or expired.',
      },
      bad: {
        description:
          'Username is not valid, provided id does not match current user, or username was already taken.',
      },
    },
    avatar: {
      summary:
        'Update avatar. Receives file as input. Avatar is then stored in the server storage and its URL is stored in the database.',
      ok: {
        description: 'Returns updated user data.',
      },
      unauthorized: {
        description: 'JWT token is invalid or expired.',
      },
      bad: {
        description:
          'File is not valid, e.g. not provided, not image, too small or too big.',
      },
      body: {
        description: 'Provide binary file to be uploaded as avatar.',
      },
    },
  },
  friends: {
    add: {
      summary: 'Add friend to user friends list.',
      ok: {
        description: 'Returns updated user data.',
      },
      unauthorized: {
        description: 'JWT token is invalid or expired.',
      },
      bad: {
        description: 'Friend not found or friend id equals current user id.',
      },
      conflict: {
        description: 'Friend already added.',
      },
    },
    get: {
      summary:
        'Returns friends of specified user. Otherwise, returns friends list of current user.',
      ok: {
        description: 'Returns user friends list.',
      },
      unauthorized: {
        description: 'JWT token is invalid or expired.',
      },
      notFound: {
        description: 'Specified user was not found.',
      },
    },
    delete: {
      summary: 'Delete friend from user friends list.',
      ok: {
        description: 'Returns updated user data.',
      },
      unauthorized: {
        description: 'JWT token is invalid or expired.',
      },
      bad: {
        description: 'Invalid friend id or friend not found.',
      },
    },
  },
  game: {
    sessions: {
      new: {
        summary: 'Create new game session.',
        created: {
          description: 'Returns newly created game session.',
        },
        bad: {
          description: 'Data is not valid.',
        },
      },
      session: {
        summary: 'Retrieve an existing game session.',
        ok: {
          description: 'Returns game session.',
        },
        notFound: {
          description: 'Game session not found.',
        },
      },
      update: {
        summary: 'Update an existing game session.',
        ok: {
          description: 'Returns updated game session.',
        },
        notFound: {
          description: 'Game session not found.',
        },
        bad: {
          description: 'Data is not valid.',
        },
      },
    },
  },
  dto: {
    intraSignin: {
      code: {
        description: 'Code provided by 42 Intra API',
        example:
          '2347e735860cd289bcefb543fe19238d25ed32255b02d566104c2c8d6a150689',
      },
      state: {
        description: 'State value required by 42 Intra API to prevent CSRF',
        example: 'aC1b4gdseU1ka4VFhYLJqFSEWu1ZFk9A',
      },
      otpCode: {
        description: 'OTP code provided by Authenticator',
        example: '123456',
      },
    },
    intraUserSignin: {
      intraId: {
        description: 'User ID from 42 Intra API',
        example: 12345,
      },
      isTwoFactorAuthEnabled: {
        description: 'Wether 2FA is enabled or not',
        example: false,
      },
      username: {
        description: 'Username from 42 Intra API',
        example: 'jdoe',
      },
      email: {
        description: 'Email from 42 Intra API',
        example: 'jdoe@student.42urduliz.com',
      },
      avatar: {
        description: 'Avatar URL from 42 Intra API',
        example: 'https://cdn.intra.42.fr/users/jdoe.jpg',
      },
    },
    activateOtp: {
      otpCode: {
        description: 'OTP code provided by Authenticator',
        example: '123456',
      },
    },
    activateOtpResponse: {
      updated: {
        description: 'Number of updated resources',
        example: 1,
      },
    },
    signinResponse: {
      created: {
        description: 'Number of created resources',
        example: 1,
      },
      access_token: {
        description: 'JWT token',
        example:
          'eyJzdWIiOiJjYzAyNGVmMi1mYjc5LTQwMGMtOGY5Ny1jZTBlNDlkN2RjNjgiLCJpYXQiOjE2ODg5MDkwMDEsImV4cCI6MTY4ODkxMDgwMX0',
      },
      data: {
        description: 'User data from database',
      },
    },
    addFriendResponse: {
      created: {
        description: 'Number of created friends',
        example: 1,
      },
      data: {
        description: 'User IDs with their friends',
        example: {
          id: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
          intraId: 12345,
          friends: [
            {
              intraId: 12346,
              avatar: 'https://cdn.intra.42.fr/users/jdoe.jpg',
              userId: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
            },
          ],
        },
      },
    },
    getFriendsResponse: {
      found: {
        description: 'Number of found friends',
        example: 2,
      },
      data: {
        description: 'User data with friends',
        example: {
          id: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
          intraId: 12345,
          friends: [
            {
              intraId: 12346,
              avatar: 'https://cdn.intra.42.fr/users/jdoe.jpg',
              userId: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
            },
            {
              intraId: 12347,
              avatar: 'https://cdn.intra.42.fr/users/jdoe.jpg',
              userId: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
            },
          ],
        },
      },
    },
    deleteFriendResponse: {
      deleted: {
        description: 'Number of deleted friends',
        example: 1,
      },
      data: {
        description: 'User data with friends',
        example: {
          id: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
          intraId: 12345,
          friends: [
            {
              intraId: 12346,
              avatar: 'https://cdn.intra.42.fr/users/jdoe.jpg',
              userId: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
            },
          ],
        },
      },
    },
    friendsParams: {
      friendId: {
        description: 'Intra ID of friend',
        example: 12346,
      },
    },
    getFriendsParams: {
      friendId: {
        description: 'Intra ID of user to retrieve friends from. Optional.',
        example: 12346,
      },
    },
    twoFactorSecret: {
      secret: {
        description: 'Secret key for 2FA',
        example: 'JBSWY3DPEHPK3PXP',
      },
      otpauthUrl: {
        description: 'URL to add authenticator',
        example:
          'otpauth://totp/2FA%20Example:jdoe%40student.42urduliz.com?secret=JBSWY3DPEHPK3PXP&issuer=2FA%20Example',
      },
    },
    updateName: {
      updated: {
        description: 'Number of updated resources',
        example: 1,
      },
      data: {
        description: 'Updated username',
        example: {
          id: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
          intraId: 12345,
          username: 'jdoe',
        },
      },
    },
    updateAvatar: {
      updated: {
        description: 'Number of updated resources',
        example: 1,
      },
      data: {
        description: 'Updated avatar',
        example: {
          id: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
          intraId: 12345,
          avatar: 'http://localhost:3000/uploads/avatars/jdoe.jpg',
        },
      },
    },
    userDto: {
      id: {
        description: 'User ID',
        example: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
      },
      createdAt: {
        description: 'Profile creation date',
        example: new Date(Date.now() - 86400000),
      },
      updatedAt: {
        description: 'Profile last update date',
        example: new Date(),
      },
      isTwoFactorAuthEnabled: {
        description: 'User 2FA enabled',
        example: true,
      },
    },
    avatarDto: {
      avatar: {
        description: 'File uploaded by user.',
        example: 'avatar.jpg',
      },
    },
    newSessionResponseDto: {
      created: {
        description: 'Number of created sessions',
        example: 1,
      },
      data: {
        description: 'Session data',
      },
    },
    updatedSessionResponseDto: {
      updated: {
        description: 'Number of updated sessions',
        example: 1,
      },
      data: {
        description: 'Session data',
      },
    },
    newSessionDto: {
      ball: {
        description: 'Stringified ball data',
        example:
          '{"x":5,"y":5,"radius":10,"velocityX":5,"velocityY":5,"speed":20,"color":"WHITE","reset":false}',
      },
      player1: {
        description: 'Player 1 data',
        example:
          '{"x":30,"y":100,"width":10,"height":100,"score":0,"color":"WHITE"}',
      },
      player2: {
        description: 'Player 2 data',
        example:
          '{"x":560,"y":100,"width":10,"height":100,"score":0,"color":"WHITE"}',
      },
    },
    foundSessionDto: {
      found: {
        description: 'Number of found sessions',
        example: 1,
      },
      data: {
        description: 'Session data',
      },
    },
    newPlayerDto: {
      id: {
        description: 'Player ID',
        example: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
      },
    },
    sessionResponseDto: {
      id: {
        description: 'Session ID',
        example: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
      },
      players: {
        description: 'Players data',
        example: [
          {
            index: 0,
            x: 5,
            y: 5,
            radius: 10,
            velocityX: 5,
            velocityY: 5,
            speed: 20,
            color: 'WHITE',
            reset: false,
          },
          {
            index: 1,
            x: 560,
            y: 100,
            width: 10,
            height: 100,
            score: 0,
            color: 'WHITE',
          },
        ],
      },
      ball: {
        description: 'Ball data',
        example: {
          x: 5,
          y: 5,
          radius: 10,
          velocityX: 5,
          velocityY: 5,
          speed: 20,
          color: 'WHITE',
          reset: false,
        },
      },
    },
  },
};
