import { IntraUserDataDto } from 'src/auth/dto/intra-user-data.dto';

export const testUserData: IntraUserDataDto = {
  avatar: 'http://placekitten.com/500/500',
  email: 'test@42urduliz.com',
  intraId: 666,
  isTwoFactorAuthEnabled: false,
  username: 'test-',
};

export const testUser2Data: IntraUserDataDto = {
  avatar: 'http://placekitten.com/600/600',
  email: 'test2@42urduliz.com',
  intraId: 667,
  isTwoFactorAuthEnabled: false,
  username: 'test2-',
};
