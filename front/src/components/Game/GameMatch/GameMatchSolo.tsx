import React, { useEffect, useRef } from 'react';
import CenteredLayout from '../../UI/CenteredLayout';
import styled from 'styled-components';
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
import { fetchAuthorized, getBaseUrl } from '../../../utils/utils';

const WrapperDiv = styled.div``;

export default function GameMatchSolo(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { userData, fetchUserData, isUserDataFetching } = useUserData();
  const [showMainCta, setShowMainCta] = React.useState<boolean>(true);
  const [gameEnd, setGameEnd] = React.useState<boolean>(false);
  const [showAnimation, setShowAnimation] = React.useState<boolean>(false); // TODO: remove
  const sessionId = useRef<string>(uuidv4());
  const { socketRef, isConnectionError } = useGameDataSocket(sessionId.current);
  const navigate = useNavigate();
  const { launchFlashMessage } = useFlashMessages();

  useEffect(() => {
    const socketCopy = socketRef.current;

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
      if (!gameEnd) {
        socketCopy.disconnect();
      }
      // TODO show feedback to user
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
    setShowMainCta(false);

    gameLoop({
      canvas: canvasRef.current as HTMLCanvasElement,
      isPlayer1: true,
      sessionId: sessionId.current,
      socket: socketRef.current as Socket,
      usersData: {
        user1: userData as UserData,
      },
    });
  };

  return (
    <WrapperDiv>
      <CenteredLayout>
        <h2 className="title-2 mb-24">Be ready to challenge our AI 💪</h2>
        <GameCanvasWithAction canvasRef={canvasRef}>
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
