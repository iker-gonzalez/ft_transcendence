import React, { useEffect, useRef, useState } from "react";
import { useGameRouteContext } from "../pages/Game";
import { createSearchParams, useNavigate } from "react-router-dom";

type SessionType = {
  id: string;
  createdAt: string;
  players: [
    {
      id: string;
      intraId: number;
      username: string;
      avatar: string;
      email: string;
      userGameSessionid: string;
    }
  ];
};

// TODO Replace with real userId from login
const userId = sessionStorage.getItem("userId") ?? 666;

export default function GameQueue() {
  const navigate = useNavigate();

  const isComponentMounted = useRef(false as Boolean);
  const [isQueued, setIsQueued] = useState(false);
  const [isSessionCreated, setIsSessionCreated] = useState(false);
  const { matchmakingSocket, sessionDataState } = useGameRouteContext();
  const newSessionRef = useRef({} as SessionType);

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
        newSessionRef.current = newSessionRes.data;

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
          sessionId: newSessionRef.current.id,
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
                {newSessionRef.current.players.map((player) => {
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

      {!isQueued && (
        <div style={{ marginTop: "50px" }}>
          <p>
            ℹ️ For now, we need to mock the userId. In one of the two tabs, set
            the intraId manually ℹ️
          </p>
          <p
            style={{
              fontFamily: "monospace",
              backgroundColor: "dimgray",
              padding: "10px",
              marginBottom: "10px",
              maxWidth: "fit-content",
            }}
          >
            sessionStorage.setItem("userId", 667)
          </p>
        </div>
      )}
    </div>
  );
}
