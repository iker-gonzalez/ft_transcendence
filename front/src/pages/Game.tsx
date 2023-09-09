import React, { useEffect, useRef, useState } from "react";
import { gameLoop } from "../game_pong/game_pong";
import { Socket, io } from "socket.io-client";
import { getBaseUrl } from "../utils/utils";

const sessionId = 12345;
const gamePlayerDataString: string = String(
  sessionStorage.getItem("gamePlayerData")
);
const gamePlayerData = JSON.parse(gamePlayerDataString);
const isPlayer1: Boolean = gamePlayerData?.isPlayer1;

function Game() {
  const isComponentMounted = useRef(false as Boolean);
  const socketRef = useRef(
    io(`${getBaseUrl()}/game-data`, {
      transports: ["websocket"],
    }) as Socket
  );
  const [showGame, setShowGame] = useState(false as Boolean);
  const [isAwaitingOpponent, setIsAwaitingOpponent] = useState(
    false as Boolean
  );
  const [isSessionCreated, setIsSessionCreated] = useState(false as Boolean);

  useEffect(() => {
    if (!sessionId || isComponentMounted.current) {
      return;
    }

    isComponentMounted.current = true;

    socketRef.current.on("connect_error", (error) => {
      console.warn("socket connect error", error);
      setShowGame(false);
    });

    socketRef.current.on("disconnect", () => {
      console.warn("socket disconnected");
      setShowGame(false);
      window.location.reload();
    });

    socketRef.current.on("connect", async () => {
      console.info("connected to socket");

      if (!isSessionCreated) {
        setIsSessionCreated(true);
        // TODO uncomment this when matchmaking flow is implemented
        // Uncomment this only once to create a Session
        // Once created, comment the code again
        // socketRef.current.emit(
        //   "startGame",
        //   JSON.stringify({
        //     gameDataId: sessionId,
        //     ball: {},
        //     user1: {},
        //     user2: {},
        //   })
        // );
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
    <main>
      <h2>Hello, {isPlayer1 ? "Player 1" : "Player 2"}</h2>
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
    </main>
  );
}

export default Game;
