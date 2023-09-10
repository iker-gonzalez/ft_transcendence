import React, { useContext, useEffect, useRef, useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import { Socket, io } from "socket.io-client";
import { getBaseUrl } from "../utils/utils";

type ContextType = {
  matchmakingSocket: Socket;
  sessionDataState: [sessionData: any, setSessionData: any];
};

export default function Game() {
  const isComponentMounted = useRef(false as Boolean);
  const [isConnectionError, setIsConnectionError] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const matchmakingSocketRef = useRef(
    io(`${getBaseUrl()}/matchmaking`, {
      transports: ["websocket"],
    }) as Socket
  );
  const [sessionData, setSessionData] = useState({} as any);

  useEffect(() => {
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
  }, []);

  return (
    <main>
      {(() => {
        if (isConnectionError) {
          return <p style={{ color: "red" }}>Error connecting to the server</p>;
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
    </main>
  );
}

export function useGameRouteContext() {
  return useOutletContext<ContextType>();
}
