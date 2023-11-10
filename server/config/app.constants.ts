import { IntraUserDataDto } from 'src/auth/dto/intra-user-data.dto';

export const testUserData: IntraUserDataDto = {
  avatar:
    process.env.FAKE_USER_1_AVATAR ||
    'https://cdn.intra.42.fr/users/medium_default.png', // Default value for testing
  email: 'test@42urduliz.com',
  intraId: 666,
  isTwoFactorAuthEnabled: false,
  username: 'test-',
};

export const testUser2Data: IntraUserDataDto = {
  avatar:
    process.env.FAKE_USER_2_AVATAR ||
    'https://cdn.intra.42.fr/users/medium_default2.png', // Default value for testing
  email: 'test2@42urduliz.com',
  intraId: 667,
  isTwoFactorAuthEnabled: false,
  username: 'test2-',
};

export const testUser3Data: IntraUserDataDto = {
  avatar:
    process.env.FAKE_USER_3_AVATAR ||
    'https://cdn.intra.42.fr/users/medium_default3.png', // Default value for testing
  email: 'test3@42urduliz.com',
  intraId: 668,
  isTwoFactorAuthEnabled: false,
  username: 'test3-',
};
