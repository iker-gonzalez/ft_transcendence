export const OTP_LENGTH = 6;

export const INVALID_OTP_ERROR = 'invalid_otp_code';

export const TEST_USERS_DATA: { code: string; avatar: string }[] = [
  {
    code: process.env.REACT_APP_USER_TEST_1_CODE || '',
    avatar: process.env.REACT_APP_USER_TEST_1_AVATAR || '',
  },
  {
    code: process.env.REACT_APP_USER_TEST_2_CODE || '',
    avatar: process.env.REACT_APP_USER_TEST_2_AVATAR || '',
  },
  {
    code: process.env.REACT_APP_USER_TEST_3_CODE || '',
    avatar: process.env.REACT_APP_USER_TEST_3_AVATAR || '',
  },
];

export const CHANNEL_TYPES = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
  PROTECTED: 'PROTECTED',
};
