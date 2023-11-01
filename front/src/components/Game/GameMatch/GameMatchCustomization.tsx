import React from 'react';
import { gameThemes } from '../../../game_pong/game_pong.constants';
import styled from 'styled-components';
import {
  darkBgColor,
  primaryAccentColor,
  primaryColor,
} from '../../../constants/color-tokens';
import GameTheme from '../../../interfaces/game-theme.interface';

const WrapperDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;

  .themes-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 25px;
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
};

const GameMatchCustomization: React.FC<GameMatchCustomizationProps> = ({
  selectedTheme,
  onThemeChange,
}: GameMatchCustomizationProps): JSX.Element => {
  return (
    <WrapperDiv>
      <h3 className="title-2 mb-24">Choose a theme</h3>
      <fieldset className="themes-container">
        <legend className="sr-only">Select a theme:</legend>
        {gameThemes.map((theme: GameTheme) => {
          return (
            <ThemeSelector $backgroundImg={theme.backgroundImg} key={theme.id}>
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
    </WrapperDiv>
  );
};

export default GameMatchCustomization;
