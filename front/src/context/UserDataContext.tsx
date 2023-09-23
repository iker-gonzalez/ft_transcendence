import React, { ReactNode, useContext, useState } from 'react';
import UserData from '../interfaces/user-data.interface';
import UserDataContextData from '../interfaces/user-data-context-data.interface';

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

  return (
    <UserDataContext.Provider
      value={{
        userData,
        setUserData,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}
