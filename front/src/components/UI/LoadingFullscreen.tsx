import React from 'react';
import styled from 'styled-components';
import LoadingSpinner from './LoadingSpinner';

const WrapperDiv = styled.div`
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

function LoadingFullscreen(): JSX.Element {
  return (
    <WrapperDiv>
      <LoadingSpinner />
    </WrapperDiv>
  );
}

export default LoadingFullscreen;
