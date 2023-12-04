import styled from 'styled-components';
import {
  darkerBgColor,
  primaryColor,
  primaryLightColor,
} from '../../constants/color-tokens';

const MainInput = styled.input`
  background: ${darkerBgColor};
  outline: none;
  border: 1px ${primaryColor} solid;
  border-radius: 5px;
  padding: 10px 25px;
  color: ${primaryLightColor};
  font-size: 16px;

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

export default MainInput;
