import UserCoreData from './user-core-data.interface';

export default interface UserData extends UserCoreData {
  isTwoFactorAuthEnabled: boolean;
}
