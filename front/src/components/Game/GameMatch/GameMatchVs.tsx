import React, { useEffect, useRef, useState } from 'react';
import { gameLoop } from '../../../game_pong/game_pong';
import { useNavigate } from 'react-router-dom';
import { useGameRouteContext } from '../../../pages/Game';
import MainButton from '../../UI/MainButton';
import { styled } from 'styled-components';
import CenteredLayout from '../../UI/CenteredLayout';
import { primaryAccentColor } from '../../../constants/color-tokens';
import useGameDataSocket, { UseGameDataSocket } from '../useGameDataSocket';
import { useFlashMessages } from '../../../context/FlashMessagesContext';
import FlashMessageLevel from '../../../interfaces/flash-message-color.interface';
import GameSessionUser from '../../../interfaces/game-session-user.interface';
import Lottie from 'lottie-react';
import waitingAnimationData from '../../../assets/lotties/waiting.json';
import { IEndGamePayload } from '../../../game_pong/game_pong.interfaces';
import confettiAnimationData from '../../../assets/lotties/confetti.json';
import { fetchAuthorized, getBaseUrl } from '../../../utils/utils';
import Cookies from 'js-cookie';
import UserData from '../../../interfaces/user-data.interface';
import GameCanvasWithAction from '../GameCanvasWithAction';

const getIsPlayer1 = (players: GameSessionUser[], userId: number): boolean => {
  const playerIndex: number = players?.findIndex(
    (player: any) => player?.intraId === userId,
  );

  return playerIndex === 0;
};

const WrapperDiv = styled.div`
  .highlighted {
    color: ${primaryAccentColor};
    font-weight: bold;
  }

  .waiting-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .waiting-animation {
      width: 200px;
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

type GameMatchVsProps = {
  sessionId: string;
  userData: UserData;
};

const GameMatchVs: React.FC<GameMatchVsProps> = ({
  sessionId,
  userData,
}): JSX.Element => {
  const navigate = useNavigate();
  const { sessionDataState } = useGameRouteContext();
  const [isAwaitingOpponent, setIsAwaitingOpponent] = useState<boolean>(false);
  const isPlayer1: boolean = getIsPlayer1(
    sessionDataState[0]?.players,
    userData.intraId,
  );
  const [showGame, setShowGame] = useState<boolean>(false);
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const [gameEnd, setGameEnd] = useState<boolean>(false);
  const [players] = useState<GameSessionUser[]>(sessionDataState[0]?.players);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { socketRef, isConnectionError }: UseGameDataSocket =
    useGameDataSocket(sessionId);
  const { launchFlashMessage } = useFlashMessages();

  useEffect(() => {
    if (!players) {
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
      (socketData: string) => {
        socketRef.current.disconnect();
        setGameEnd(true);

        const parsedData: IEndGamePayload = JSON.parse(socketData);
        const { player } = parsedData;

        if (player.isWinner) setShowAnimation(true);

        console.log('parsedData', socketData);
        fetchAuthorized(`${getBaseUrl()}/game/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
          body: socketData,
        })
          .then((res: any) => {
            console.log(res);
            return res.json();
          })
          .then((data: any) => {
            console.log(data);
          })
          .catch((e: any) => {
            console.error('Error creating new game data set: ', e);
          });
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
        <h2 className="title-2">
          Hello,{' '}
          <span className="highlighted">
            {isPlayer1 ? players[0].username : players[1].username}
          </span>
        </h2>
        <GameCanvasWithAction canvasRef={canvasRef}>
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
        </GameCanvasWithAction>
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
};

export default GameMatchVs;
