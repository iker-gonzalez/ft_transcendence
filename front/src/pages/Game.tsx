import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useOutletContext } from 'react-router-dom';
import SessionData from '../interfaces/game-session-data.interface';
import { useUserData } from '../context/UserDataContext';
import UserData from '../interfaces/user-data.interface';
import UserDataContextData from '../interfaces/user-data-context-data.interface';

type GameContextType = {
  sessionDataState: [
    sessionData: SessionData,
    setSessionData: React.Dispatch<React.SetStateAction<SessionData>>,
  ];
  userData: UserData;
};

const Game: React.FC = (): JSX.Element => {
  const [sessionData, setSessionData] = useState<SessionData>();
  const { userData }: UserDataContextData = useUserData();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) {
      navigate('/');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main>
      <Outlet
        context={{
          sessionDataState: [sessionData, setSessionData],
          userData,
        }}
      />
    </main>
  );
};

export default Game;

export function useGameRouteContext() {
  return useOutletContext<GameContextType>();
}
