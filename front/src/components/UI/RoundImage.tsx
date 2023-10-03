import { styled } from 'styled-components';
import { primaryLightColor } from '../../constants/color-tokens';

const RoundImg = styled.img`
  border-radius: 50%;
  object-fit: cover;
  height: 100%;
  width: 100%;

  background-color: ${primaryLightColor};
`;

export default RoundImg;
