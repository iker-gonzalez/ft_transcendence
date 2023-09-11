import React, { useEffect, useRef, useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import { Socket, io } from "socket.io-client";
import { getBaseUrl } from "../utils/utils";
import SessionData from "../models/session-data.interface";
import { styled } from "styled-components";

type GameContextType = {
  matchmakingSocket: Socket;
  sessionDataState: [
    sessionData: SessionData,
    setSessionData: (arg0: SessionData) => void
  ];
};

const WrapperMain = styled.main`
  .error-message {
    color: red;
  }
`;

export default function Game() {
  const isComponentMounted = useRef<boolean>(false);
  const [isConnectionError, setIsConnectionError] = useState<boolean>(false);
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
  const matchmakingSocketRef = useRef<Socket>(
    io(`${getBaseUrl()}/matchmaking`, {
      transports: ["websocket"],
    })
  );
  const [sessionData, setSessionData] = useState<SessionData>();

  useEffect(() => {
    // We want to run this effect only once
    if (isComponentMounted.current) {
      return;
    }

    matchmakingSocketRef.current.on("connect_error", (error) => {
      setIsSocketConnected(false);
      setIsConnectionError(true);
      console.warn("Matchmaking socket connection error: ", error);
    });

    matchmakingSocketRef.current.on("disconnect", () => {
      setIsSocketConnected(false);
      console.warn("matchmaking socket disconnected");
    });

    matchmakingSocketRef.current.on("connect", async () => {
      setIsSocketConnected(true);
      console.info("Matchmaking socket connected");
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <WrapperMain>
      {(() => {
        if (!isSocketConnected && !isConnectionError) {
          return <p>Connecting to the socket...</p>;
        }

        if (isConnectionError) {
          return (
            <p className="error-message">Error connecting to the server</p>
          );
        }

        if (isSocketConnected) {
          return (
            <Outlet
              context={{
                matchmakingSocket: matchmakingSocketRef.current,
                sessionDataState: [sessionData, setSessionData],
              }}
            />
          );
        } else {
          <p>Connecting to the sever...</p>;
        }
      })()}
    </WrapperMain>
  );
}

export function useGameRouteContext() {
  return useOutletContext<GameContextType>();
}
