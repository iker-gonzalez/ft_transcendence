import React, { PropsWithChildren } from 'react';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../constants/canvas';
import styled from 'styled-components';

const WrapperDiv = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .children-container {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
  }
`;

type GameCanvasWithActionProps = {
  canvasRef: React.RefObject<HTMLCanvasElement>;
};

export default function GameCanvasWithAction({
  canvasRef,
  children,
}: PropsWithChildren<GameCanvasWithActionProps>): JSX.Element {
  return (
    <WrapperDiv>
      <div className="children-container">{children}</div>
      <canvas
        className="canvas"
        id="gamePong"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        ref={canvasRef}
      />
    </WrapperDiv>
  );
}
