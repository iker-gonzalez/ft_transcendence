import React, { useEffect } from 'react';
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
import { lg } from '../../constants/styles';
import { useUserData } from '../../context/UserDataContext';

const WrapperDiv = styled.div`
  .game-page-section {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .game-modes-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    column-gap: 35px;
    gap: 24px;

    @media (width > ${lg}) {
      flex-direction: row;
      gap: 40px;
    }

    > * {
      width: 100%;
      max-width: 450px;
      aspect-ratio: 3/2;

      @media (width > ${lg}) {
        width: 450px;
        aspect-ratio: 4/3;
      }
    }

    .game-mode-gradient {
      background-color: ${darkestBgColor};
      transition: background-color 0.2s ease-in-out;

      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;

      position: relative;

      &:hover {
        background-color: ${darkerBgColor};
      }
    }

    .game-mode {
      @media (width > ${lg}) {
        aspect-ratio: 4/3;
      }

      padding-bottom: 30px;
      @media (width> ${lg}) {
        padding-bottom: 50px;
      }

      display: flex;
      justify-content: center;
      align-items: center;

      overflow: hidden;

      .solo {
        height: 300px;
        object-fit: contain;
        transform: scale(1.4);
      }

      .vs {
        width: 80%;
        height: 300px;
        object-fit: contain;
      }

      .game-name {
        color: ${primaryLightColor};

        font-family: 'Dogica';
        font-weight: bold;

        font-size: 1.2rem;
        @media (width > ${lg}) {
          font-size: 1.5rem;
        }

        position: absolute;
        bottom: 15px;
        @media (width > ${lg}) {
          bottom: 5px;
        }
        left: 50%;
        transform: translateX(-50%);
      }
    }
  }
`;

export default function GameIndex(): JSX.Element {
  const { userData } = useUserData();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) {
      navigate('/');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
