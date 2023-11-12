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
    deactivate: {
      summary: 'Deactivate 2FA on user profile. Receives OTP code as input.',
      ok: {
        description: 'OTP gets deactivated.',
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
    search: {
      summary: 'Retrieve users that match the provided query.',
      ok: {
        description: 'Returns users that match the provided query.',
      },
      unauthorized: {
        description: 'JWT token is invalid or expired.',
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
    data: {
      new: {
        summary: 'Create new game data set.',
        created: {
          description: 'Returns newly created game data set.',
        },
        bad: {
          description: 'Data is not valid.',
        },
        unauthorized: {
          description: 'JWT token is invalid or expired.',
        },
      },
      fetch: {
        summary: 'Fetch user sessions.',
        ok: {
          description: 'Returns user sessions.',
        },
        unauthorized: {
          description: 'JWT token is invalid or expired.',
        },
        unprocessable: {
          description: 'User does not exist.',
        },
      },
    },
    stats: {
      get: {
        summary:
          'Retrieve stats of either specified user or current user if user is not specified.',
        ok: {
          description: 'Returns user stats.',
        },
        unauthorized: {
          description: 'JWT token is invalid or expired.',
        },
        unprocessable: {
          description: 'User does not exist.',
        },
      },
    },
    leaderboard: {
      get: {
        summary: 'Retrieve global leaderboard.',
        ok: {
          description: 'Returns global leaderboard.',
        },
      },
    },
  },
  status: {
    patch: {
      summary: 'Update user status.',
      ok: {
        description: 'Returns updated user status.',
      },
      unauthorized: {
        description: 'JWT token is invalid or expired.',
      },
      bad: {
        description: 'Status is invalid.',
      },
    },
  },
  chat: {
    data: {
      summary: 'Return all the DM between two users',
      ok: {
        description: 'Return Direct messages sorted by time',
      },
    },
    all: {
      summary: 'Return all the users which had DM',
      ok: {
        description: 'Return Direct messages sorted by time',
      },
    },
    channel: {
      summary: 'Return all channel users is in',
      ok: {
        description: 'Return all channel users is in',
      },
    },
    allExistingChannel:{
      summary: 'Return all existing channel un DB. The name and its privacy',
      ok: {
        description: 'Return all exisitng channel ins the DB. Private, protected and public',
      },
    },
    allUserChannelIn:{
      summary: 'Return all existing channel un DB. The name and its privacy',
      ok: {
        description: 'Return all exisitng channel ins the DB. Private, protected and public',
      },
    },
    channelMess: {
      summary: 'Return all the messages that have been sent in the channel ',
      ok: {
        description: 'Return contet, username, data',
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
              username: 'jdoe',
              email: 'jdoe@gmail.com',
            },
            {
              intraId: 12347,
              avatar: 'https://cdn.intra.42.fr/users/jdoe.jpg',
              userId: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
              username: 'jdoe2',
              email: 'jdoe@gmail.com',
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
    newPlayerDto: {
      id: {
        description: 'Player ID',
        example: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
      },
    },
    username: {
      regex: {
        message: 'Forbidden character',
      },
    },
    userSearchResponse: {
      found: {
        description: 'Number of found users',
        example: 2,
      },
      data: {
        description: 'Data of found users',
        example: [
          {
            id: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
            intraId: 12345,
            username: 'jdoe',
            avatar: 'https://cdn.intra.42.fr/users/jdoe.jpg',
          },
          {
            id: 'c024ef2-fb79-400c-8f97-ce0e49d7dc69',
            intraId: 12347,
            username: 'jdoe2',
            avatar: 'https://cdn.intra.42.fr/users/jdoe2.jpg',
          },
        ],
      },
    },
    userSearchQuery: {
      description: 'String to match against username',
      example: 'jdoe',
    },
    NewGameDataSetBodyDto: {
      gameDataId: {
        description: 'Game data ID',
        example: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
      },
      startedAt: {
        description: 'Date when game started',
        example: new Date(),
      },
      elapsedTime: {
        description: 'Elapsed time in ms',
        example: 1000,
      },
      player: {
        description: 'Player data',
        example: {
          intraId: 12345,
          score: 5,
          avatar: 'https://cdn.intra.42.fr/users/jdoe.jpg',
          username: 'jdoe',
          isWinner: true,
        },
      },
    },
    newGameDataResponseDto: {
      created: {
        description: 'Number of created game data',
        example: 1,
      },
      data: {
        description: 'Game data',
        example: {
          sessionId: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
          id: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
          startedAt: '2021-05-06T15:00:00.000Z',
          elapsedTime: 1000,
          players: [
            {
              id: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
              intraId: 12345,
              score: 5,
              avatar: 'https://cdn.intra.42.fr/users/jdoe.jpg',
              username: 'jdoe',
              isWinner: true,
              gameDataSetId: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
            },
          ],
        },
      },
    },
    fetchUserSessionsResponseDto: {
      found: {
        description: 'Number of found sessions',
        example: 1,
      },
      data: {
        description: 'Sessions data',
        example: {
          sessionId: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
          startedAt: '2021-05-06T15:00:00.000Z',
          elapsedTime: 1000,
          players: [
            {
              intraId: 12345,
              score: 5,
              avatar: 'https://cdn.intra.42.fr/users/jdoe.jpg',
              username: 'jdoe',
              isWinner: true,
              gameDataSetId: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
            },
          ],
        },
      },
    },
    fetchGameStatsResponseDto: {
      found: {
        description: 'Number of found sessions on which stats are based',
        example: 1,
      },
      data: {
        description: 'Stats data',
        example: {
          rank: 2,
          totalGames: 43,
          wins: 10,
          losses: 33,
          longestWinStreak: 4,
          currentWinStreak: 0,
          longestMatch: 621961,
          quickestWin: 608692,
          totalGameTime: 123456789,
          nemesis: {
            avatar: '/static/media/c3po_avatar.763ed1d4866a4dc88e10.webp',
            intraId: 42,
            username: 'bot',
            count: 29,
          },
          victim: {
            avatar: 'https://i.pravatar.cc/600?img=10',
            intraId: 667,
            username: 'test2-',
            count: 7,
          },
          busiestDay: {
            date: 'Wed Oct 18 2023',
            count: 17,
          },
        },
      },
    },
    fetchLeaderboardResponseDto: {
      found: {
        description: 'Number of found users',
        example: 2,
      },
      data: {
        description: 'Array with users and their stats',
        example: [
          {
            user: {
              username: 'ngasco',
              intraId: 88103,
              avatar:
                'https://cdn.intra.42.fr/users/a17a37c3c5f97cc6d8e2454710c10ccd/ngasco.jpg',
            },
            stats: {
              rank: 2.4,
              wins: 12,
              losses: 33,
              totalGames: 45,
              totalGameTime: 2127849,
            },
          },
          {
            user: {
              username: 'test2-',
              intraId: 667,
              avatar: 'https://i.pravatar.cc/600?img=10', 
            },
            stats: {
              rank: 1,
              wins: 5,
              losses: 16,
              totalGames: 21,
              totalGameTime: 945295,
            },
          },
        ],
      },
    },
    patchStatusBodyDto: {
      status: {
        description: 'User status',
        example: 'ONLINE',
      },
    },
    patchStatusResDto: {
      updated: {
        description: 'Number of updated resources',
        example: 1,
      },
      data: {
        description: 'Updated status',
        example: {
          intraId: 12345,
          status: 'ONLINE',
        },
      },
    },
    allusersDMWithDTO: {
      data: {
        description: 'User with id, avatar and username',
        example: {
          id: '31f0dd9b-c8fa-4df3-a07c-6bd5e40c5643',
          avatar: 'https://i.pravatar.cc/600?img=32',
          username: 'test2-',
        },
      },
    },
      allExistingChannelsDTO: {
        data: {
          description: 'Room name and privacy type',
          example: {
            name: 'roomZal6',
            type: 'PUBLIC',
          },
        },
    },
    conversationMessageDTO: {
      data: {
        description:
          'conversation between two users. Who sent and who recevied the message',
        example: {
          senderId: '623274f5-5fa1-4ad8-b7a1-c1edcb239af2',
          receiverId: '1cc83703-a2ed-4ec2-b021-c5db82bb3d94',
          content: 'Soy el otro usuario 333',
          createdAt: '2023-11-05T10:38:33.782Z',
          senderName: 'test3-',
          receiverName: 'test-',
          senderAvatar: 'https://i.pravatar.cc/600?img=35',
          receiverAvatar: 'https://i.pravatar.cc/600?img=8',
        },
      },
    },
    allUserChannelInDTO: {
      data: {
        description:
          'The name of all channel a user is in',
        example: {
          name: 'roomZal6',
        },
      },
    },

  },
};
