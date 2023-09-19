import { styled } from 'styled-components';
import { darkerBgColor } from '../../constants/color-tokens';

const ContrastPanel = styled.div`
  background-color: ${darkerBgColor};

  width: fit-content;
  padding: 25px 20px;
  border-radius: 20px;

  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
`;

export default ContrastPanel;
