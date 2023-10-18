import React, { PropsWithChildren } from 'react';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../constants/canvas';
import styled from 'styled-components';

const WrapperDiv = styled.div`
  position: relative;
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
  className?: string;
};

export default function GameCanvasWithAction({
  canvasRef,
  className,
  children,
}: PropsWithChildren<GameCanvasWithActionProps>): JSX.Element {
  return (
    <WrapperDiv className={className}>
      <div className="children-container">{children}</div>
      <canvas
        id="gamePong"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        ref={canvasRef}
      />
    </WrapperDiv>
  );
}
