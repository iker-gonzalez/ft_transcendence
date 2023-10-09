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
    border: 1px dotted red;
    margin-top: 24px;
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
        const usernames = {
          username1: players[0].username,
          username2: players[1].username,
        };
        gameLoop(
          canvasRef.current,
          socketRef.current,
          isPlayer1,
          sessionId,
          usernames,
        );
      }
    });
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
      </CenteredLayout>
    </WrapperDiv>
  );
}
