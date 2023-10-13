import React, {
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import UserData from '../interfaces/user-data.interface';
import UserDataContextData from '../interfaces/user-data-context-data.interface';
import { fetchAuthorized, getBaseUrl } from '../utils/utils';
import FriendData from '../interfaces/friend-data.interface';
import Cookies from 'js-cookie';
import UserFriendsContextData from '../interfaces/user-friends-context-data.interface';

/**
 * Context object for user data.
 */
const UserDataContext = React.createContext<UserDataContextData>({
  fetchUserData: () => {},
  isUserDataFetching: false,
  setUserData: () => {},
  userData: null,
});

/**
 * Hook to access user data from the context.
 * @returns An object containing the user data and a function to set the user data.
 */
export function useUserData(): UserDataContextData {
  return useContext(UserDataContext);
}

const UserFriendsContext = React.createContext<UserFriendsContextData>({
  fetchFriendsList: () => {},
  isFetchingFriends: false,
  setUserFriends: () => {},
  userFriends: [],
});

/**
 * Hook to access the user friends data from the context.
 * @returns An object containing the user friends data and a function to update it.
 */
export function useUserFriends(): UserFriendsContextData {
  return useContext(UserFriendsContext);
}

/**
 * Provider component for user data context.
 * @param children The child components to render.
 * @returns The user data context provider.
 */
export function UserDataProvider({ children }: PropsWithChildren): ReactNode {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isUserDataFetching, setIsUserDataFetching] = useState<boolean>(false);

  const [userFriends, setUserFriends] = useState<FriendData[]>([]);
  const [isFetchingFriends, setIsFetchingFriends] = useState<boolean>(false);

  const fetchFriendsList = useCallback(async () => {
    setIsFetchingFriends(true);

    const response: Response = await fetchAuthorized(
      `${getBaseUrl()}/friends`,
      {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      },
    );

    const data = await response.json();

    const friendsData: FriendData[] = data.data.friends;

    setUserFriends(friendsData);
    setIsFetchingFriends(false);
  }, []);

  const fetchUserData = useCallback(async (token: string) => {
    setIsUserDataFetching(true);

    // Do not use fetchAuthorized here to avoid infinite loop
    const response: Response = await fetch(`${getBaseUrl()}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const fetchedUserData = await response.json();

    const userData: UserData = fetchedUserData.data;

    setIsUserDataFetching(false);
    setUserData(userData);
  }, []);

  return (
    <UserDataContext.Provider
      value={{
        fetchUserData,
        isUserDataFetching,
        setUserData,
        userData,
      }}
    >
      <UserFriendsContext.Provider
        value={{
          fetchFriendsList,
          isFetchingFriends,
          setUserFriends,
          userFriends,
        }}
      >
        {children}
      </UserFriendsContext.Provider>
    </UserDataContext.Provider>
  );
}
