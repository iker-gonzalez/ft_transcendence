import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainButton from '../UI/MainButton';
import { styled } from 'styled-components';
import CenteredLayout from '../UI/CenteredLayout';

const WrapperDiv = styled.div`
  .game-page-section {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .selector-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 25px;

    min-width: 500px;

    .game-mode-selector {
      width: 100%;
      height: 60px;
    }
  }
`;

export default function GameIndex(): JSX.Element {
  const navigate = useNavigate();

  return (
    <WrapperDiv>
      <CenteredLayout>
        <h1 className="title-1 mb-24">Game page</h1>
        <section className="game-page-section mb-24">
          <h2 className="title-2 mb-16">Choose a game mode</h2>
          <div className="selector-container">
            <MainButton
              onClick={() => {
                navigate('queue');
              }}
              className="game-mode-selector"
            >
              2 players
            </MainButton>
            <MainButton
              onClick={() => {
                navigate('match?solo=true');
              }}
              className="game-mode-selector"
            >
              1 player
            </MainButton>
          </div>
        </section>
      </CenteredLayout>
    </WrapperDiv>
  );
}
