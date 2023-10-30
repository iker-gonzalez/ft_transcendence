import React, { useEffect } from 'react';
import styled from 'styled-components';
import {
  darkBgColor,
  primaryLightColor,
  primaryAccentColor,
} from '../constants/color-tokens';
import { Link } from 'react-router-dom';
import { useUserData } from '../context/UserDataContext';

const NavbarContainer = styled.nav`
  background-color: ${darkBgColor};
  color: ${primaryLightColor};
  padding: 10px 0;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
`;

const NavList = styled.nav`
  list-style: none;
  padding: 0;
  display: flex;
  justify-content: center;
  gap: 30px;

  .link {
    text-decoration: none;
    color: ${primaryLightColor};
    font-size: 18px;
    font-weight: bold;
    transition: color 0.3s ease-in-out;

    &.disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    &:hover:not(.disabled) {
      color: ${primaryAccentColor}; /* Change color on hover */
    }
  }
`;

const Navbar = (): JSX.Element => {
  const { userData } = useUserData();
  const [isLogged, setIsLogged] = React.useState<boolean>(!!userData);

  useEffect(() => {
    setIsLogged(!!userData);
  }, [userData]);

  const disableLink = (e: any) => {
    if (!isLogged) {
      e.preventDefault();
      return;
    }
  };

  return (
    <NavbarContainer>
      <NavList>
        <Link to="/" className="link">
          Home
        </Link>
        <Link
          to="/profile"
          onClick={disableLink}
          className={`${!isLogged && 'disabled'} link`}
        >
          Profile
        </Link>
        <Link
          to="/game"
          onClick={disableLink}
          className={`${!isLogged && 'disabled'} link`}
        >
          Play
        </Link>
        <Link
          to="/stats"
          onClick={disableLink}
          className={`${!isLogged && 'disabled'} link`}
        >
          Stats
        </Link>
        <Link to="/leaderboard" className="link">
          Leaderboard
        </Link>
      </NavList>
    </NavbarContainer>
  );
};

export default Navbar;
