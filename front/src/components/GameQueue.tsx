import React, { useEffect, useRef, useState } from "react";
import { useGameRouteContext } from "../pages/Game";
import { createSearchParams, useNavigate } from "react-router-dom";
import User from "../models/user.interface";

// TODO Replace with real userId from login
const userId: string | null = sessionStorage.getItem("intraId");

export default function GameQueue() {
  const navigate = useNavigate();

  const isComponentMounted = useRef<boolean>(false);
  const [isQueued, setIsQueued] = useState<boolean>(false);
  const [isSessionCreated, setIsSessionCreated] = useState<boolean>(false);
  const { matchmakingSocket, sessionDataState } = useGameRouteContext();

  useEffect(() => {
    if (isComponentMounted.current) {
      return;
    }

    isComponentMounted.current = true;

    matchmakingSocket.on(`userJoined/${userId}`, (userJoinedRes) => {
      if (userJoinedRes.queued) {
        setIsQueued(true);
      }
    });

    matchmakingSocket.on(`newSession/${userId}`, (newSessionRes) => {
      if (newSessionRes.success) {
        const setSessionData = sessionDataState[1];
        setSessionData(newSessionRes.data);

        setIsSessionCreated(true);
      } else {
        console.warn("error creating session");
      }
    });
  }, []);

  const onJoinQueue = () => {
    matchmakingSocket.emit(
      "newUser",
      JSON.stringify({
        intraId: userId,
      })
    );
  };

  const onGoToMatch = () => {
    navigate(
      {
        pathname: "/game/match",
        search: createSearchParams({
          sessionId: sessionDataState[0].id,
        }).toString(),
      },
      {
        replace: true,
      }
    );
  };

  const disconnectSocket = () => {
    matchmakingSocket.disconnect();
  };

  return (
    <div>
      <h1>
        Game queue for user with intradId{" "}
        <span style={{ color: "yellow" }}>{userId}</span>
      </h1>
      <p>This is the page that is shown when users decide to join the queue.</p>
      <p>
        The user joins the queue and stays there until they're joined by another
        user.
      </p>
      <p>Once the session is created, the game session can start.</p>
      {(function () {
        if (isSessionCreated) {
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "white",
                width: "fit-content",
                color: "black",
                borderRadius: "25px",
                padding: "15px 30px",
                margin: "10px",
              }}
            >
              <h2>This is your new session</h2>
              <div style={{ display: "flex", gap: "30px" }}>
                {sessionDataState[0].players.map((player: User) => {
                  return (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      key={player.id}
                    >
                      <p style={{ fontWeight: "bold" }}>{player.username}</p>
                      <img
                        style={{
                          borderRadius: "50%",
                          width: "150px",
                          objectFit: "cover",
                        }}
                        alt=""
                        src={player.avatar}
                      />
                    </div>
                  );
                })}
              </div>
              <button
                style={{
                  width: "175px",
                  height: "50px",
                  backgroundColor: "#FFD369",
                  color: "black",
                  borderRadius: "5px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                  boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
                  marginTop: "20px",
                }}
                onClick={onGoToMatch}
              >
                Go to match
              </button>
            </div>
          );
        } else {
          if (isQueued) {
            return (
              <p style={{ fontWeight: "bold", color: "yellow" }}>
                Queue joined. Waiting for another player to join...
              </p>
            );
          } else {
            return (
              <button
                style={{
                  width: "175px",
                  height: "50px",
                  backgroundColor: "#FFD369",
                  color: "black",
                  borderRadius: "5px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                  boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
                }}
                onClick={onJoinQueue}
              >
                Join a queue
              </button>
            );
          }
        }
      })()}
      <button onClick={disconnectSocket}>Remove from queue</button>
    </div>
  );
}
