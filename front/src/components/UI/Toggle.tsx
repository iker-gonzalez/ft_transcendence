import styled from 'styled-components';
import {
  darkBgColor,
  darkestBgColor,
  primaryAccentColor,
} from '../../constants/color-tokens';

const toggleWidth = '60px';
const toggleHeight = '30px';
const toggleSelectorMargin = '3px';
const Toggle = styled.div`
  width: ${toggleWidth};
  height: ${toggleHeight};

  background-color: ${darkestBgColor};
  outline: 2px ${primaryAccentColor} solid;
  border-radius: 20px;

  display: flex;
  justify-content: center;
  align-items: center;

  > label {
    width: 100%;
    height: 100%;

    cursor: pointer;

    &::before {
      content: '';
      display: block;
      height: calc(${toggleHeight} - 2 * ${toggleSelectorMargin});
      aspect-ratio: 1/1;
      border-radius: 50%;
      margin: ${toggleSelectorMargin};
    }

    &:has(input) {
      &::before {
        background-color: ${darkBgColor};
        filter: brightness(1.6);
        transition: all 0.2s ease-in-out;
      }
    }

    &:has(input:checked) {
      &::before {
        background-color: ${primaryAccentColor};
        filter: unset;
        transform: translateX(30px);
      }
    }

    /* Fix for outdated Firefox versions */
    @-moz-document url-prefix() {
      &::before {
        background-color: ${darkBgColor};
        filter: brightness(1.6);
        transition: all 0.2s ease-in-out;
      }
    }
  }

  /* Fix for outdated Firefox versions */
  @-moz-document url-prefix() {
    &.selected {
      > label {
        &::before {
          background-color: ${primaryAccentColor};
          filter: unset;
          transform: translateX(30px);
        }
      }
    }
  }
`;

export default Toggle;
