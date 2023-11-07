import React from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';
import CenteredLayout from '../UI/CenteredLayout';
import Lottie from 'lottie-react';
import SoloModeAnimationData from '../../assets/lotties/solo-mode.json';
import VsModeAnimationData from '../../assets/lotties/vs-mode.json';
import GradientBorder from '../UI/GradientBorder';
import {
  darkerBgColor,
  darkestBgColor,
  primaryLightColor,
} from '../../constants/color-tokens';
import { sm } from '../../constants/styles';

const WrapperDiv = styled.div`
  .game-page-section {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .game-modes-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 35px;

    .game-mode-gradient {
      background-color: ${darkestBgColor};
      transition: background-color 0.2s ease-in-out;

      &:hover {
        background-color: ${darkerBgColor};
      }
    }

    .game-mode {
      position: relative;

      max-width: 450px;
      aspect-ratio: 3/2;
      @media (width > ${sm}) {
        aspect-ratio: 4/3;
      }

      padding-bottom: 30px;
      @media (width> ${sm}) {
        padding-bottom: 50px;
      }

      display: flex;
      justify-content: center;
      align-items: center;

      overflow: hidden;

      .solo {
        transform: scale(1.2);
      }

      .vs {
        width: 80%;
      }

      .game-name {
        color: ${primaryLightColor};

        font-family: 'Dogica';
        font-weight: bold;

        font-size: 1rem;
        @media (width > ${sm}) {
          font-size: 1.5rem;
        }

        position: absolute;
        bottom: 5px;
        left: 50%;
        transform: translateX(-50%);
      }
    }
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
        <h1 className="title-1 mb-24">Choose a game mode</h1>
        <section className="game-page-section mb-24">
          <div className="game-modes-container">
            <GradientBorder className="game-mode-gradient">
              <button
                className="game-mode"
                onClick={() => {
                  navigate('match?solo=true');
                }}
              >
                <Lottie
                  animationData={SoloModeAnimationData}
                  className="solo"
                />
                <span className="game-name">Solo</span>
              </button>
            </GradientBorder>
            <GradientBorder className="game-mode-gradient">
              <button
                className="game-mode"
                onClick={() => {
                  navigate('queue');
                }}
              >
                <Lottie animationData={VsModeAnimationData} className="vs" />
                <span className="game-name">1vs1</span>
              </button>
            </GradientBorder>
          </div>
        </section>
      </CenteredLayout>
    </WrapperDiv>
  );
}
