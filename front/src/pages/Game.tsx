import React, { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import SessionData from '../interfaces/game-session-data.interface';

type GameContextType = {
  matchmakingSocket: Socket;
  sessionDataState: [
    sessionData: SessionData,
    setSessionData: (arg0: SessionData) => void,
  ];
};

export default function Game() {
  const [sessionData, setSessionData] = useState<SessionData>();

  return (
    <main>
      {(() => {
        return (
          <Outlet
            context={{
              sessionDataState: [sessionData, setSessionData],
            }}
          />
        );
      })()}
    </main>
  );
}

export function useGameRouteContext() {
  return useOutletContext<GameContextType>();
}
