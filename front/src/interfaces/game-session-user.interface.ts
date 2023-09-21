import UserCoreData from './user-core-data.interface';

export default interface GameSessionUser extends UserCoreData {
  id: string;
  userGameSessionId: string;
}
