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
    },
  },
  users: {
    me: {
      summary: 'Retrieve user data from database.',
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
          'Username is not valid or provided id does not match current user.',
      },
    },
    avatar: {
      summary: 'Update avatar.',
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
    updateName: {
      updated: {
        description: 'Number of updated resources',
        example: 1,
      },
      data: {
        description: 'Updated user data',
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
    },
    avatarDto: {
      avatar: {
        description: 'File uploaded by user.',
        example: 'avatar.jpg',
      },
    },
  },
};
