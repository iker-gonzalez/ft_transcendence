import { IntraUserDataDto } from 'src/auth/dto/intra-user-data.dto';

export const testUserData: IntraUserDataDto = {
  avatar: 'https://i.pravatar.cc/600?img=8',
  email: 'test@42urduliz.com',
  intraId: 666,
  isTwoFactorAuthEnabled: false,
  username: 'test-',
};

export const testUser2Data: IntraUserDataDto = {
  avatar: 'https://i.pravatar.cc/600?img=32',
  email: 'test2@42urduliz.com',
  intraId: 667,
  isTwoFactorAuthEnabled: false,
  username: 'test2-',
};

export const testUser3Data: IntraUserDataDto = {
  avatar: 'https://i.pravatar.cc/600?img=35',
  email: 'test3@42urduliz.com',
  intraId: 668,
  isTwoFactorAuthEnabled: false,
  username: 'test3-',
};
