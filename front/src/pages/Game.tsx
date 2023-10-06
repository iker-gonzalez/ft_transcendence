import React, { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import SessionData from '../interfaces/game-session-data.interface';

type GameContextType = {
  sessionDataState: [
    sessionData: SessionData,
    setSessionData: React.Dispatch<React.SetStateAction<SessionData>>,
  ];
};

const Game: React.FC = (): JSX.Element => {
  const [sessionData, setSessionData] = useState<SessionData>();

  return (
    <main>
      <Outlet
        context={{
          sessionDataState: [sessionData, setSessionData],
        }}
      />
    </main>
  );
};

export default Game;

export function useGameRouteContext() {
  return useOutletContext<GameContextType>();
}
