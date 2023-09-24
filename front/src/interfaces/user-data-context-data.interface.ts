import { Dispatch, SetStateAction } from 'react';
import UserData from './user-data.interface';

export default interface UserDataContextData {
  userData: UserData | null;
  setUserData: Dispatch<SetStateAction<UserData | null>>;
}
