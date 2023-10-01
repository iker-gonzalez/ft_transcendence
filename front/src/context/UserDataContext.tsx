import React, {
  PropsWithChildren,
  ReactNode,
  useContext,
  useState,
} from 'react';
import UserData from '../interfaces/user-data.interface';
import UserDataContextData from '../interfaces/user-data-context-data.interface';
import { getBaseUrl } from '../utils/utils';

interface RefetchUserDataFunction {
  (token: string): Promise<UserData | null>;
}

/**
 * Context object for user data.
 */
const UserDataContext = React.createContext<UserDataContextData>({
  userData: null,
  setUserData: () => {},
});

/**
 * Asynchronously fetches the user data from the server.
 * @param token The user's access token.
 * @returns The user data or null if the request fails.
 */
async function fetchUserData(token: string): Promise<UserData> {
  const response: Response = await fetch(`${getBaseUrl()}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const fetchedUserData = await response.json();

  const userData: UserData = fetchedUserData.data;
  return userData;
}

/**
 * Context object for the refetch user data function.
 */
const RefetchUserDataContext =
  React.createContext<RefetchUserDataFunction>(fetchUserData);

/**
 * Hook to access user data from the context.
 * @returns An object containing the user data and a function to set the user data.
 */
export function useUserData(): UserDataContextData {
  return useContext(UserDataContext);
}

/**
 * Hook to access the refetch user data function from the context.
 * @returns The refetch user data function.
 */
export function useRefetchUserData(): RefetchUserDataFunction {
  return useContext(RefetchUserDataContext);
}

/**
 * Provider component for user data context.
 * @param children The child components to render.
 * @returns The user data context provider.
 */
export function UserDataProvider({ children }: PropsWithChildren): ReactNode {
  const [userData, setUserData] = useState<UserData | null>(null);

  return (
    <UserDataContext.Provider
      value={{
        userData,
        setUserData,
      }}
    >
      <RefetchUserDataContext.Provider value={fetchUserData}>
        {children}
      </RefetchUserDataContext.Provider>
    </UserDataContext.Provider>
  );
}
