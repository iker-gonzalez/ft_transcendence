import { Dispatch, SetStateAction } from 'react';
import UserData from './user-data.interface';

export default interface UserDataContextData {
  fetchUserData: (token: string) => void;
  isUserDataFetching: boolean;
  setUserData: Dispatch<SetStateAction<UserData | null>>;
  userData: UserData | null;
}
