import React, { useEffect, useRef, useState } from 'react';
import { gameLoop } from '../../game_pong/game_pong';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGameRouteContext } from '../../pages/Game';
import MainButton from '../UI/MainButton';
import { styled } from 'styled-components';
import CenteredLayout from '../UI/CenteredLayout';
import { primaryAccentColor } from '../../constants/color-tokens';
import useGameDataSocket, { UseGameDataSocket } from './useGameDataSocket';
import { useFlashMessages } from '../../context/FlashMessagesContext';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import GameSessionUser from '../../interfaces/game-session-user.interface';
import Lottie from 'lottie-react';
import waitingAnimationData from '../../assets/lotties/waiting.json';
import { IEndGamePayload } from '../../game_pong/game_pong.interfaces';
import confettiAnimationData from '../../assets/lotties/confetti.json';

const getIsPlayer1 = (players: GameSessionUser[], userId: number): boolean => {
  const playerIndex: number = players?.findIndex(
    (player: any) => player.intraId === userId,
  );

  return playerIndex === 0;
};

const WrapperDiv = styled.div`
  .highlighted {
    color: ${primaryAccentColor};
    font-weight: bold;
  }

  .game-container {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .cta-container {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;

    .waiting-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .waiting-animation {
        width: 200px;
      }
    }
  }

  .canvas {
    margin-top: 24px;
  }

  .new-game-button {
    margin-top: 30px;
  }

  .end-animation {
    position: fixed;
    z-index: 1000;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    height: min(100vh, 1000px);
  }
`;

export default function GameMatch(): JSX.Element {
  const navigate = useNavigate();
  const { sessionDataState, userData } = useGameRouteContext();
  const [isAwaitingOpponent, setIsAwaitingOpponent] = useState<boolean>(false);
  const isPlayer1: boolean = getIsPlayer1(
    sessionDataState[0]?.players,
    userData?.intraId,
  );
  const sessionId: string | null = useSearchParams()[0]!.get('sessionId');
  const [showGame, setShowGame] = useState<boolean>(false);
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const [gameEnd, setGameEnd] = useState<boolean>(false);
  const [players] = useState<GameSessionUser[]>(sessionDataState[0]?.players);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { socketRef, isConnectionError }: UseGameDataSocket =
    useGameDataSocket(sessionId);
  const { launchFlashMessage } = useFlashMessages();

  useEffect(() => {
    if (!sessionId || !players) {
      navigate('/game');
    }

    socketRef.current.on(`allOpponentsReady/${sessionId}`, () => {
      setShowGame(true);

      if (canvasRef.current) {
        const usersData: { user1: GameSessionUser; user2: GameSessionUser } = {
          user1: players[0],
          user2: players[1],
        };

        gameLoop(
          canvasRef.current,
          socketRef.current,
          isPlayer1,
          sessionId,
          usersData,
        );
      }
    });

    socketRef.current.on(
      `gameEnded/${userData.intraId}/${sessionId}`,
      (data: string) => {
        const parsedData: IEndGamePayload = JSON.parse(data);
        console.log('data is', parsedData);
        socketRef.current.disconnect();
        const { player } = parsedData;
        setGameEnd(true);
        if (player.isWinner) setShowAnimation(true);
        // TODO hit endpoint to store game data
      },
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isConnectionError) {
      navigate('/game');
      launchFlashMessage(
        'Connection error. Please try again later.',
        FlashMessageLevel.ERROR,
      );
    }
  }, [isConnectionError, launchFlashMessage, navigate]);

  const onReadyToPlay = (): void => {
    socketRef.current.emit(
      'ready',
      JSON.stringify({ gameDataId: sessionId, isUser1: isPlayer1 }),
    );
    setIsAwaitingOpponent(true);
  };

  if (!players) return <></>;
  return (
    <WrapperDiv>
      <CenteredLayout>
        <h2>
          Hello,{' '}
          <span className="highlighted">
            {isPlayer1 ? players[0].username : players[1].username}
          </span>
        </h2>
        <div className="game-container">
          {!showGame && (
            <div className="cta-container">
              {isAwaitingOpponent ? (
                <div className="waiting-container">
                  <Lottie
                    animationData={waitingAnimationData}
                    className="waiting-animation"
                  />
                  <p>Awaiting opponent...</p>
                </div>
              ) : (
                <MainButton onClick={onReadyToPlay}>Play</MainButton>
              )}
            </div>
          )}
          <canvas
            className="canvas"
            id="gamePong"
            width="900"
            height="600"
            ref={canvasRef}
          />
        </div>
        {gameEnd && (
          <div className="new-game-button">
            <MainButton
              onClick={() => {
                navigate('/game');
              }}
            >
              Start new game
            </MainButton>
          </div>
        )}
      </CenteredLayout>
      {showAnimation && (
        <Lottie
          animationData={confettiAnimationData}
          loop={false}
          onComplete={() => {
            setShowAnimation(false);
          }}
          className="end-animation"
        />
      )}
    </WrapperDiv>
  );
}
