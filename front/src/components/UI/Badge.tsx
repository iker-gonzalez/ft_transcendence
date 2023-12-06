import styled from 'styled-components';
import { blackColor } from '../../constants/color-tokens';

const Badge = styled.div`
  padding: 3px 10px;

  background: #00aeb5;
  background: linear-gradient(90deg, #00aeb5 0%, rgba(255, 211, 105, 1) 100%);
  border-radius: 20px;

  display: flex;
  justify-content: center;
  align-items: center;

  * {
    color: ${blackColor};
    font-weight: bold;
  }
`;

export default Badge;
