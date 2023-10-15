import React, { useEffect, useRef } from 'react';
import CenteredLayout from '../../UI/CenteredLayout';
import styled from 'styled-components';
import GameCanvasWithAction from '../GameCanvasWithAction';
import MainButton from '../../UI/MainButton';
import { gameLoop } from '../../../game_pong/game_pong';
import { useUserData } from '../../../context/UserDataContext';
import UserData from '../../../interfaces/user-data.interface';
import Cookies from 'js-cookie';

const WrapperDiv = styled.div``;

export default function GameMatchSolo(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { userData, fetchUserData, isUserDataFetching } = useUserData();
  const [showMainCta, setShowMainCta] = React.useState<boolean>(true);

  useEffect(() => {
    if (!userData) {
      const token = Cookies.get('token');
      fetchUserData(token as string);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onStartNewGame = (): void => {
    setShowMainCta(false);

    gameLoop({
      canvas: canvasRef.current as HTMLCanvasElement,
      isPlayer1: true,
      usersData: {
        user1: userData as UserData,
      },
    });
  };

  return (
    <WrapperDiv>
      <CenteredLayout>
        <h2 className="title-2">Be ready to challenge our AI 💪</h2>
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
      </CenteredLayout>
    </WrapperDiv>
  );
}
