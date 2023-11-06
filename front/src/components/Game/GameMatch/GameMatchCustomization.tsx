import React from 'react';
import { gameThemes } from '../../../game_pong/game_pong.constants';
import styled from 'styled-components';
import {
  darkBgColor,
  primaryAccentColor,
  primaryColor,
} from '../../../constants/color-tokens';
import GameTheme from '../../../interfaces/game-theme.interface';
import Toggle from '../../UI/Toggle';
import GamePowerUp from '../../../interfaces/game-power-up.interface';
import ContrastPanel from '../../UI/ContrastPanel';
import ForbiddenIcon from '../../../assets/svg/forbidden.svg';

const WrapperDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 100px;

  .themes-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 25px;
  }

  .customization-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;

    .toggle-container {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .toggle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 60px;

        .forbidden-icon {
          width: 24px;
          object-fit: contain;
          margin-left: auto;

          cursor: help;
        }
      }
    }
  }
`;

const ThemeSelector = styled.div<{ $backgroundImg: string }>`
  width: 150px;
  aspect-ratio: 3/2;

  background: transparent;
  border: 3px ${darkBgColor} solid;
  border-radius: 5px;

  transition: all 0.3s ease-in-out;

  display: flex;

  &:has(input:checked) {
    border-color: ${primaryColor};
  }

  &:hover {
    border-color: ${primaryAccentColor};
  }

  label {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    cursor: pointer;

    background-image: url(${(props) => props.$backgroundImg});
    background-size: cover;
  }
`;

type GameMatchCustomizationProps = {
  selectedTheme: GameTheme;
  onThemeChange:
    | React.Dispatch<React.SetStateAction<GameTheme>>
    | ((theme: GameTheme) => void);
  selectedPowerUps: GamePowerUp[];
  onPowerUpsChange: React.Dispatch<React.SetStateAction<GamePowerUp[]>>;
  cannotActivatePowerUps?: boolean;
};

const GameMatchCustomization: React.FC<GameMatchCustomizationProps> = ({
  selectedTheme,
  onThemeChange,
  selectedPowerUps,
  onPowerUpsChange,
  cannotActivatePowerUps,
}: GameMatchCustomizationProps): JSX.Element => {
  return (
    <ContrastPanel>
      <WrapperDiv>
        <div className="customization-container">
          <h3 className="title-2 mb-24">Choose a theme</h3>
          <fieldset className="themes-container">
            <legend className="sr-only">Select a theme:</legend>
            {gameThemes.map((theme: GameTheme) => {
              return (
                <ThemeSelector
                  $backgroundImg={theme.backgroundImg}
                  key={theme.id}
                >
                  <label htmlFor={theme.id} className="title-3">
                    {theme.name}
                    <input
                      type="radio"
                      id={theme.id}
                      name="theme"
                      value={theme.id}
                      checked={selectedTheme.id === theme.id}
                      onChange={() => onThemeChange(theme)}
                      className="sr-only"
                    />
                  </label>
                </ThemeSelector>
              );
            })}
          </fieldset>
        </div>
        <div className="customization-container">
          <h3 className="title-2 mb-24">Twist it up</h3>
          <fieldset>
            <legend className="sr-only">Choose your power-ups:</legend>
            <div className="toggle-container">
              {selectedPowerUps.map((powerUp) => {
                return (
                  <div className="toggle" key={powerUp.id}>
                    <p>{powerUp.description}</p>
                    {cannotActivatePowerUps ? (
                      <img
                        src={ForbiddenIcon}
                        alt="Forbidden"
                        className="forbidden-icon"
                        title="Only the session leader can customize the game."
                      />
                    ) : (
                      <Toggle>
                        <label htmlFor={powerUp.id}>
                          <span className="sr-only">{powerUp.description}</span>
                          <input
                            type="checkbox"
                            id={powerUp.id}
                            name={powerUp.id}
                            className="sr-only"
                            checked={powerUp.value}
                            onChange={(e) => {
                              onPowerUpsChange((prevState) => {
                                const powerUpIndex = prevState.findIndex(
                                  (powerUp: any) => powerUp.id === e.target.id,
                                );

                                const newState = [...prevState];
                                newState[powerUpIndex].value = e.target.checked;

                                return newState;
                              });
                            }}
                          />
                        </label>
                      </Toggle>
                    )}
                  </div>
                );
              })}
            </div>
          </fieldset>
        </div>
      </WrapperDiv>
    </ContrastPanel>
  );
};

export default GameMatchCustomization;
