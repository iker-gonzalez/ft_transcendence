import UserData from './user-data.interface';

export default interface UserDataContextData {
  userData: UserData | null;
  setUserData: (userData: UserData | null) => void;
}
