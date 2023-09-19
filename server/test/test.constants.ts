export const port = 3333;
export const baseUrl = `http://localhost:${port}`;

export const userData = {
  intraId: 88103,
  username: 'ntest',
  email: 'test@student.42urduliz.com',
  avatar: 'https://cdn.intra.42.fr/users/test.jpg',
  isTwoFactorAuthEnabled: false,
};

export const userData2 = {
  intraId: 88104,
  username: 'ntest2',
  email: 'test2@student.42urduliz.com',
  avatar: 'https://cdn.intra.42.fr/users/test2.jpg',
  isTwoFactorAuthEnabled: false,
};

export const userData3 = {
  intraId: 88105,
  username: 'ntest3',
  email: 'test3@student.42urduliz.com',
  avatar: 'https://cdn.intra.42.fr/users/test3.jpg',
  isTwoFactorAuthEnabled: false,
};

export const testAvatarPath = `public/uploads/avatars/${userData.username}.png`;

export const intraUserToken =
  'de08a5e57571452221f95fc44d0073d2a383178d7d893d99c29ad955103b3981';

export const uuidRegex =
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
