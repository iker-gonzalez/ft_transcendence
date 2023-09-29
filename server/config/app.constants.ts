import { IntraUserDataDto } from 'src/auth/dto/intra-user-data.dto';

export const testUserData: IntraUserDataDto = {
  avatar: 'https://i.pravatar.cc/600?img=8',
  email: 'test@42urduliz.com',
  intraId: 666,
  isTwoFactorAuthEnabled: false,
  username: 'test-',
};

export const testUser2Data: IntraUserDataDto = {
  avatar: 'https://i.pravatar.cc/600?img=10',
  email: 'test2@42urduliz.com',
  intraId: 667,
  isTwoFactorAuthEnabled: false,
  username: 'test2-',
};
