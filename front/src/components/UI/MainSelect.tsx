import styled from 'styled-components';
import {
  darkerBgColor,
  primaryColor,
  primaryLightColor,
} from '../../constants/color-tokens';

const MainSelect = styled.select`
  background: ${darkerBgColor};
  outline: none;
  border: 1px ${primaryColor} solid;
  border-radius: 5px;
  padding: 10px;
  color: ${primaryLightColor};
  font-size: 16px;
`;

export default MainSelect;
