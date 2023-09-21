import React, { ReactNode, useContext, useState } from 'react';
import UserData from '../interfaces/user-data.interface';

interface UserDataContextData {
  userData: UserData | null;
  setUserData: (userData: UserData | null) => void;
}

/**
 * Context object for user data.
 */
const UserDataContext = React.createContext<UserDataContextData>({
  userData: null,
  setUserData: () => {},
});

/**
 * Hook to access user data from the context.
 * @returns An object containing the user data and a function to set the user data.
 */
export function useUserData(): UserDataContextData {
  return useContext(UserDataContext);
}

/**
 * Provider component for user data context.
 * @param children The child components to render.
 * @returns The user data context provider.
 */
export function UserDataProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const [userData, setUserData] = useState<UserData | null>(null);

  /**
   * Gets the persisted user data from local storage or state.
   * @returns The persisted user data or null if none exists.
   */
  function getPersistedUserData(): UserData | null {
    if (userData) {
      return userData;
    }

    const localStorageUserData: string | null =
      localStorage.getItem('userData');
    if (localStorageUserData) {
      return JSON.parse(localStorageUserData);
    }

    return null;
  }

  /**
   * Persists the user data to local storage and state.
   * @param userData The user data to persist.
   */
  function setPersistedUserData(userData: UserData | null): void {
    setUserData(userData);

    if (!userData) {
      localStorage.removeItem('userData');
    } else {
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  }

  return (
    <UserDataContext.Provider
      value={{
        userData: getPersistedUserData(),
        setUserData: setPersistedUserData,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}
