import React from 'react';

import confettiAnimationData from '../../../assets/lotties/confetti.json';
import Lottie from 'lottie-react';
import styled from 'styled-components';

type GameMatchConfettiAnimationProps = {
  onComplete: () => void;
};

const StyedLottie = styled(Lottie)`
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  height: min(100vh, 1000px);
`;

export default function GameMatchConfettiAnimation({
  onComplete,
}: GameMatchConfettiAnimationProps): JSX.Element {
  return (
    <StyedLottie
      animationData={confettiAnimationData}
      loop={false}
      onComplete={onComplete}
    />
  );
}
