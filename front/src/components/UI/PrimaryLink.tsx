import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { primaryAccentColor } from '../../constants/color-tokens';

export const PrimaryLink = styled(Link)`
  color: ${primaryAccentColor};
  font-weight: bold;
  text-decoration: none;
`;
