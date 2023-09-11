import React, { useEffect, useRef, useState } from "react";
import { gameLoop } from "../game_pong/game_pong";
import { Socket, io } from "socket.io-client";
import { getBaseUrl } from "../utils/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGameRouteContext } from "../pages/Game";
import SessionData from "../models/session-data.interface";
import MainButton from "./UI/MainButton";

const getIsPlayer1 = (sessionData: SessionData, userId: number): boolean => {
  const playerIndex: number = sessionData!.players!.findIndex(
    (player: any) => player.intraId === userId
  );

  return playerIndex === 0;
};

const getUserId = (): number => {
  const userIdString: string | null = sessionStorage.getItem("intraId");

  return userIdString ? parseInt(userIdString) : 666;
};

// TODO Replace with real userId
const userId: number = getUserId();

export default function GameMatch() {
  const navigate = useNavigate();
  const { sessionDataState } = useGameRouteContext();

  const isComponentMounted = useRef<boolean>(false);
  const [isSessionCreated, setIsSessionCreated] = useState<boolean>(false);
  const [isAwaitingOpponent, setIsAwaitingOpponent] = useState<boolean>(false);
  const isPlayer1: boolean = getIsPlayer1(sessionDataState[0], userId);
  const sessionId: string | null = useSearchParams()[0]!.get("sessionId");
  const [showGame, setShowGame] = useState<boolean>(false);
  const socketRef = useRef<Socket>(
    io(`${getBaseUrl()}/game-data`, {
      transports: ["websocket"],
    })
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
              <MainButton onClick={onReadyToPlay}>Play</MainButton>
            )}
          </div>
        )}
        <canvas id="gamePong" width="900" height="600"></canvas>
      </div>
    </div>
  );
}
