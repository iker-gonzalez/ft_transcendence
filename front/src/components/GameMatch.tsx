import React, { useEffect, useRef, useState } from "react";
import { gameLoop } from "../game_pong/game_pong";
import { Socket, io } from "socket.io-client";
import { getBaseUrl } from "../utils/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGameRouteContext } from "../pages/Game";

const getIsPlayer1 = (sessionData: any, userId: number): Boolean => {
  const playerIndex = sessionData.players?.findIndex(
    (player: any) => player.intraId === userId
  );

  return playerIndex === 0;
};

const getUserId = (): number => {
  const userIdString: string | null = sessionStorage.getItem("userId");

  return userIdString ? parseInt(userIdString) : 666;
};

// Replace with real userId
const userId: number = getUserId();

export default function GameMatch() {
  const navigate = useNavigate();
  const { sessionDataState } = useGameRouteContext();

  const isComponentMounted = useRef(false as Boolean);
  const [isSessionCreated, setIsSessionCreated] = useState(false as Boolean);
  const [isAwaitingOpponent, setIsAwaitingOpponent] = useState(false);
  const isPlayer1 = getIsPlayer1(sessionDataState[0], userId);
  const sessionId = useSearchParams()[0].get("sessionId");
  const [showGame, setShowGame] = useState(false as Boolean);
  const socketRef = useRef(
    io(`${getBaseUrl()}/game-data`, {
      transports: ["websocket"],
    }) as Socket
  );

  useEffect(() => {
    if (!sessionId) {
      navigate("/game");
    }

    if (isComponentMounted.current) return;

    isComponentMounted.current = true;

    socketRef.current.on("connect_error", (error) => {
      console.warn("GameData socket connection error: ", error);
      setShowGame(false);
    });

    socketRef.current.on("disconnect", () => {
      console.warn("GameData socket disconnected");
      setShowGame(false);
      window.location.reload();
    });

    socketRef.current.on("connect", async () => {
      console.info("Connected to GameData socket");

      if (!isSessionCreated) {
        setIsSessionCreated(true);
        socketRef.current.emit(
          "startGame",
          JSON.stringify({
            gameDataId: sessionId,
            ball: {},
            user1: {},
            user2: {},
          })
        );
      }
    });

    socketRef.current.on(`allOpponentsReady/${sessionId}`, () => {
      setShowGame(true);
      isComponentMounted.current = true;

      const canvas: HTMLElement = document.getElementById(
        "gamePong"
      ) as HTMLCanvasElement;
      gameLoop(canvas, socketRef.current, isPlayer1, sessionId);
    });
  }, []);

  const onReadyToPlay = (): void => {
    socketRef.current.emit(
      "ready",
      JSON.stringify({ gameDataId: sessionId, isUser1: isPlayer1 })
    );
    setIsAwaitingOpponent(true);
  };

  return (
    <div>
      <h2>Hello, {isPlayer1 ? "Player 1" : "Player 2"}</h2>
      <p>
        This is the page the is shown when two users are matched in a session
        and the game can begin.
      </p>
      <div
        style={{
          position: "relative",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {!showGame && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            {isAwaitingOpponent ? (
              <p>Awaiting opponent...</p>
            ) : (
              <button
                onClick={onReadyToPlay}
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
              >
                Play
              </button>
            )}
          </div>
        )}
        <canvas id="gamePong" width="900" height="600"></canvas>
      </div>
    </div>
  );
}
