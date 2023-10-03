import React from 'react';
import styled, { keyframes } from 'styled-components';
import { primaryAccentColor } from '../constants/color-tokens';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingSpinner = styled.div`
  position: absolute;
  top: 0;
  left: 0;

  width: 100vw;
  height: 100vh;
  overflow: hidden;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const Spinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid ${primaryAccentColor}; /* Change the spinner color */
  width: 60px;
  height: 60px;
  animation: ${spin} 1s linear infinite;
`;

function LoadingPage(): JSX.Element {
  return (
    <div>
      <LoadingSpinner>
        <Spinner />
      </LoadingSpinner>
    </div>
  );
}

export default LoadingPage;
