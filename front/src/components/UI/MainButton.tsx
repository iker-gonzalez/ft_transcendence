import { styled } from 'styled-components';

import { primaryColor } from '../../constants/color-tokens';

const Button = styled.button`
  width: 175px;
  height: 50px;
  background-color: ${primaryColor};
  color: black;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  &:hover {
    filter: brightness(1.1);
  }
`;

export default Button;
