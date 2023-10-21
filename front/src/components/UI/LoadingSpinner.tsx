import React from 'react';
import styled, { keyframes } from 'styled-components';
import { primaryAccentColor } from '../../constants/color-tokens';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid ${primaryAccentColor};
  width: 60px;
  height: 60px;
  animation: ${spin} 1s linear infinite;
`;

function LoadingSpinner(): JSX.Element {
  return <Spinner />;
}

export default LoadingSpinner;
