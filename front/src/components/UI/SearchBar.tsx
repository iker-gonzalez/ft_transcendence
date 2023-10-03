import styled from 'styled-components';
import { darkBgColor, primaryLightColor } from '../../constants/color-tokens';

const SearchBar = styled.input`
  width: 100%;
  background-color: ${darkBgColor};

  border: none;
  padding: 10px 20px;
  border-radius: 20px;

  color: ${primaryLightColor};
  font-size: 1rem;
  text-align: center;
`;

export default SearchBar;
