import styled from 'styled-components';
import { primaryLightColor } from '../../constants/color-tokens';

const GradientProgressBar = styled.progress<{ $progressBarWidth: string }>`
  height: 25px;

  &::-webkit-progress-bar {
    background-color: transparent;
    border-radius: 2px;
    border: 1px ${primaryLightColor} solid;
  }

  &::-webkit-progress-value {
    background: #00aeb5;
    background: linear-gradient(90deg, #00aeb5 0%, rgba(255, 211, 105, 1) 100%);
    background-size: ${({ $progressBarWidth }) =>
      `${$progressBarWidth} 100%, 100% 100%, 100% 100%`};
  }
`;

export default GradientProgressBar;
