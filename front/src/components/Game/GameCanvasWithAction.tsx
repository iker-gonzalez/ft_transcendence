import React, { PropsWithChildren } from 'react';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../constants/canvas';
import styled from 'styled-components';

const WrapperDiv = styled.div<{ $background: string }>`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  padding: 24px;
  margin-bottom: 24px;

  .children-container {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
  }

  canvas {
    box-shadow: rgba(0, 173, 181, 0.1) 0px 4px 16px,
      rgba(0, 173, 181, 0.1) 0px 8px 24px, rgba(0, 173, 181, 0.1) 0px 16px 56px;

    background: ${({ $background }) => `url(${$background})`};
    background-size: cover;

    transition: all 0.3s ease-in-out;
  }
`;

type GameCanvasWithActionProps = {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  className?: string;
  background: string;
};

export default function GameCanvasWithAction({
  canvasRef,
  className,
  children,
  background,
}: PropsWithChildren<GameCanvasWithActionProps>): JSX.Element {
  return (
    <WrapperDiv className={className} $background={background}>
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
