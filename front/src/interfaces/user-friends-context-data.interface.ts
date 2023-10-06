import { Dispatch, SetStateAction } from 'react';
import FriendData from './friend-data.interface';

export default interface UserFriendsContextData {
  userFriends: FriendData[];
  setUserFriends: Dispatch<SetStateAction<FriendData[]>>;
  isFetchingFriends: boolean;
  fetchFriendsList: () => void;
}
