import React from 'react';

import MainButton from '../../UI/MainButton';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const WrapperDiv = styled.div`
  margin-top: 30px;
`;

export default function GameMatchEndGameAction(): JSX.Element {
  const navigate = useNavigate();

  return (
    <WrapperDiv>
      <MainButton
        onClick={() => {
          navigate('/game');
        }}
      >
        Start new game
      </MainButton>
    </WrapperDiv>
  );
}
