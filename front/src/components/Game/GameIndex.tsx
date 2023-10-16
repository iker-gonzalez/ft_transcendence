import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainButton from '../UI/MainButton';
import { styled } from 'styled-components';
import CenteredLayout from '../UI/CenteredLayout';
import ContrastPanel from '../UI/ContrastPanel';

const WrapperDiv = styled.div`
  .user-info-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 100px;
    grid-gap: 20px;

    margin-bottom: 20px;
  }

  .user-info-box {
    width: 300px;
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 20px;
  }

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
        <section className="game-page-section">
          <h2 className="title-2 mb-16">Game dashboard</h2>
          <div className="user-info-container">
            <ContrastPanel className="user-info-box">
              <p>Online friends?</p>
            </ContrastPanel>
            <ContrastPanel className="user-info-box">
              <p>User stats?</p>
            </ContrastPanel>
          </div>
        </section>
      </CenteredLayout>
    </WrapperDiv>
  );
}
