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
import { fetchAuthorized, getBaseUrl } from '../../../utils/utils';
import Cookies from 'js-cookie';
import UserData from '../../../interfaces/user-data.interface';
import GameCanvasWithAction from '../GameCanvasWithAction';
import GameMatchEndGameAction from './GameMatchEndGameAction';
import GameMatchConfettiAnimation from './GameMatchConfettiAnimation';

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

  .canvas-container {
    margin-top: 24px;
    position: relative;

    &.overlay::after {
      content: ''; // ::before and ::after both require content
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: linear-gradient(
        to right top,
        #222831,
        #004352,
        #006054,
        #3a7833,
        #968300
      );
      opacity: 0.7;
    }

    .opponent-left-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      width: min(400px, 50vw);
      text-shadow: 2px 7px 5px rgba(0, 0, 0, 0.3),
        0px -4px 10px rgba(255, 255, 255, 0.3);
    }
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
  const [showCanvasChildren, setShowCanvasChildren] = useState<boolean>(true);
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const [gameEnd, setGameEnd] = useState<boolean>(false);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);
  const [players] = useState<GameSessionUser[]>(sessionDataState[0]?.players);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { socketRef, isConnectionError }: UseGameDataSocket =
    useGameDataSocket(sessionId);
  const { launchFlashMessage } = useFlashMessages();

  useEffect(() => {
    if (!players) {
      navigate('/game');
    }

    const socketCopy = socketRef.current;

    socketRef.current.on(`allOpponentsReady/${sessionId}`, () => {
      setShowCanvasChildren(false);

      if (canvasRef.current) {
        const usersData: { user1: GameSessionUser; user2: GameSessionUser } = {
          user1: players[0],
          user2: players[1],
        };

        gameLoop({
          canvas: canvasRef.current,
          socket: socketRef.current,
          isPlayer1,
          sessionId,
          usersData,
        });
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

        fetchAuthorized(`${getBaseUrl()}/game/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
          body: socketData,
        })
          .then((res: any) => {
            return res.json();
          })
          .then((data: any) => {
            // TODO check this
            console.log(data);
          })
          .catch((e: any) => {
            console.error('Error creating new game data set: ', e);
          });
        // TODO hit endpoint to store game data
      },
    );

    socketRef.current.on(
      `gameAborted/user${isPlayer1 ? '2' : '1'}/${sessionId}`,
      () => {
        setGameEnd(true);
        setShowCanvasChildren(true);
        setOpponentLeft(true);
        socketRef.current.disconnect();
      },
    );

    return () => {
      if (!gameEnd) {
        socketCopy.emit(
          'abort',
          JSON.stringify({ gameDataId: sessionId, isUser1: isPlayer1 }),
          () => {
            socketCopy.disconnect();
            // TODO show feedback to user
          },
        );
      }
    };
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
        <GameCanvasWithAction
          canvasRef={canvasRef}
          className={`${opponentLeft ? 'overlay' : ''} canvas-container`}
        >
          {showCanvasChildren && (
            <div className="cta-container">
              {(() => {
                if (opponentLeft) {
                  return (
                    <p className="title-2 opponent-left-text">
                      Your opponent couldn't deal with your great mightiness and
                      left the game 🐇
                    </p>
                  );
                }

                if (isAwaitingOpponent) {
                  return (
                    <div className="waiting-container">
                      <Lottie
                        animationData={waitingAnimationData}
                        className="waiting-animation"
                      />
                      <p>Awaiting opponent...</p>
                    </div>
                  );
                }

                return <MainButton onClick={onReadyToPlay}>Play</MainButton>;
              })()}
            </div>
          )}
        </GameCanvasWithAction>
        {gameEnd && <GameMatchEndGameAction />}
      </CenteredLayout>
      {showAnimation && (
        <GameMatchConfettiAnimation
          onComplete={() => {
            setShowAnimation(false);
          }}
        />
      )}
    </WrapperDiv>
  );
};

export default GameMatchVs;
