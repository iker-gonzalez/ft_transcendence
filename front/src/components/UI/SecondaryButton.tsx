import { styled } from 'styled-components';

import {
  darkBgColor,
  primaryColor,
  primaryLightColor,
} from '../../constants/color-tokens';

const SecondaryButton = styled.button`
  padding: 10px 25px;
  background-color: transparent;
  color: ${primaryLightColor};
  border-radius: 5px;
  border: 1px ${primaryColor} solid;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: ${darkBgColor};
  }
`;

export default SecondaryButton;
