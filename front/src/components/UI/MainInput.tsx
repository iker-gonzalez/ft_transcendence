import styled from 'styled-components';
import {
  darkBgColor,
  darkerBgColor,
  primaryColor,
  primaryLightColor,
} from '../../constants/color-tokens';

const Input = styled.input`
  background: ${darkerBgColor};
  outline: none;
  border: 1px ${primaryColor} solid;
  border-radius: 5px;
  padding: 10px 25px;
  color: ${primaryLightColor};
  font-size: 16px;
`;

export default Input;
