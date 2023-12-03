import UserCoreData from './user-core-data.interface';

export default interface FriendData extends UserCoreData {
  userId: string;
  isBlocked: boolean;
}
