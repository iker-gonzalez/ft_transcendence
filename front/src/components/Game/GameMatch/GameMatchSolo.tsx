import React, { useEffect, useRef } from 'react';
import CenteredLayout from '../../UI/CenteredLayout';
import GameCanvasWithAction from '../GameCanvasWithAction';
import MainButton from '../../UI/MainButton';
import { gameLoop } from '../../../game_pong/game_pong';
import { useUserData } from '../../../context/UserDataContext';
import UserData from '../../../interfaces/user-data.interface';
import Cookies from 'js-cookie';
import useGameDataSocket from '../useGameDataSocket';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { useFlashMessages } from '../../../context/FlashMessagesContext';
import FlashMessageLevel from '../../../interfaces/flash-message-color.interface';
import { Socket } from 'socket.io-client';
import { IEndGamePayload } from '../../../game_pong/game_pong.interfaces';
import GameMatchEndGameAction from './GameMatchEndGameAction';
import GameMatchConfettiAnimation from './GameMatchConfettiAnimation';
import {
  fetchAuthorized,
  getBaseUrl,
  patchUserStatus,
} from '../../../utils/utils';
import UserStatus from '../../../interfaces/user-status.interface';
import GameMatchCustomization from './GameMatchCustomization';
import {
  gamePowerUps,
  gameThemes,
} from '../../../game_pong/game_pong.constants';
import GameTheme from '../../../interfaces/game-theme.interface';
import GamePowerUp from '../../../interfaces/game-power-up.interface';
import styled from 'styled-components';

const WrapperDiv = styled.div`
  .title {
    text-align: center;
  }
`;

export default function GameMatchSolo(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { userData, fetchUserData, isUserDataFetching } = useUserData();
  const [showMainCta, setShowMainCta] = React.useState<boolean>(true);
  const gameStartedRef = useRef<boolean>(false);
  const [gameEnd, setGameEnd] = React.useState<boolean>(false);
  const [showAnimation, setShowAnimation] = React.useState<boolean>(false); // TODO: remove
  const [selectedTheme, setSelectedTheme] = React.useState<GameTheme>(
    gameThemes[0],
  );
  const [selectedPowerUps, setSelectedPowerUps] = React.useState<GamePowerUp[]>(
    gamePowerUps.map((powerUp) => Object.assign({}, powerUp)),
  );
  const sessionId = useRef<string>(uuidv4());
  const { socketRef, isConnectionError } = useGameDataSocket(sessionId.current);
  const navigate = useNavigate();
  const { launchFlashMessage } = useFlashMessages();

  useEffect(() => {
    const socketCopy = socketRef.current;
    const sessionIdCopy = sessionId.current;
    const gameStartedCopy = gameStartedRef;

    if (!userData) {
      const token = Cookies.get('token');
      fetchUserData(token as string);
    }

    if (isConnectionError) {
      navigate('/game');
      launchFlashMessage(
        'Connection error. Please try again later.',
        FlashMessageLevel.ERROR,
      );
    }

    return () => {
      if (gameStartedCopy.current && !gameEnd) {
        socketCopy.emit(
          'abort',
          JSON.stringify({ gameDataId: sessionIdCopy, isSoloMode: true }),
          () => {
            patchUserStatus(UserStatus.ONLINE);
            launchFlashMessage(
              'You abandoned a match 👎 Data will be lost',
              FlashMessageLevel.INFO,
            );
            socketCopy.disconnect();
          },
        );
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const saveMatch = (socketData: string): void => {
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
          //  TODO check this
          console.log(data);
        })
        .catch((e: any) => {
          console.error('Error creating new game data set: ', e);
        });
    };

    if (userData && socketRef.current) {
      socketRef.current.on(
        `gameEnded/${userData.intraId}/${sessionId.current}`,
        (socketData: string) => {
          patchUserStatus(UserStatus.ONLINE);

          setGameEnd(true);

          const parsedData: IEndGamePayload = JSON.parse(socketData);
          const { player } = parsedData;

          if (player.isWinner) setShowAnimation(true);

          saveMatch(socketData);
        },
      );

      socketRef.current.on(
        `gameEnded/42/${sessionId.current}`,
        (socketData: string) => {
          socketRef.current.disconnect();

          saveMatch(socketData);
        },
      );
    }
  }, [userData, socketRef]);

  const onStartNewGame = (): void => {
    patchUserStatus(UserStatus.PLAYING);

    gameStartedRef.current = true;
    setShowMainCta(false);

    gameLoop({
      canvas: canvasRef.current as HTMLCanvasElement,
      isPlayer1: true,
      sessionId: sessionId.current,
      socket: socketRef.current as Socket,
      usersData: {
        user1: userData as UserData,
      },
      theme: selectedTheme,
      powerUps: selectedPowerUps,
    });
  };

  return (
    <WrapperDiv>
      <CenteredLayout>
        <h2 className="title title-1 mb-24">Be ready to challenge our AI 🦾</h2>
        <h3 className="title title-3">
          Paddle controls: MOUSE 🖱 || ARROW UP ⬆️ || ARROW DOWN ⬇️
        </h3>
        <h3 className="title title-3">
          Music controls 🔡: HIGH 'h' || LOW 'l' || MUTE 'm' || UNMUTE 'u'
        </h3>
        <GameCanvasWithAction
          canvasRef={canvasRef}
          background={selectedTheme.backgroundImg}
        >
          {showMainCta && (
            <MainButton
              onClick={onStartNewGame}
              disabled={Boolean(isUserDataFetching && canvasRef.current)}
            >
              Play
            </MainButton>
          )}
        </GameCanvasWithAction>
        {gameEnd && <GameMatchEndGameAction />}
        {showMainCta && (
          <GameMatchCustomization
            selectedTheme={selectedTheme}
            onThemeChange={setSelectedTheme}
            selectedPowerUps={selectedPowerUps}
            onPowerUpsChange={setSelectedPowerUps}
          />
        )}
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
}
