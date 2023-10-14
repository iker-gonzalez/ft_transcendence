import React, { useRef } from 'react';
import CenteredLayout from '../../UI/CenteredLayout';
import styled from 'styled-components';
import GameCanvasWithAction from '../GameCanvasWithAction';
import MainButton from '../../UI/MainButton';

const WrapperDiv = styled.div``;

export default function GameMatchSolo(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <WrapperDiv>
      <CenteredLayout>
        <h2 className="title-2">Be ready to challenge our AI 💪</h2>
        <GameCanvasWithAction canvasRef={canvasRef}>
          <MainButton onClick={() => {}}>Play</MainButton>
        </GameCanvasWithAction>
      </CenteredLayout>
    </WrapperDiv>
  );
}
