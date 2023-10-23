import React from 'react';
import styled from 'styled-components';
import {
  darkBgColor,
  primaryLightColor,
  primaryAccentColor,
} from '../constants/color-tokens';
import { Link } from 'react-router-dom';

// Define styled components
const NavbarContainer = styled.nav`
  background-color: ${darkBgColor};
  color: ${primaryLightColor};
  padding: 10px 0;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  justify-content: center;
`;

const NavItem = styled.li`
  margin: 0 20px;
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: ${primaryLightColor};
  font-size: 18px;
  font-weight: bold;
  transition: color 0.3s ease-in-out;

  &:hover {
    color: ${primaryAccentColor}; /* Change color on hover */
  }
`;

const Navbar = (): JSX.Element => {
  return (
    <NavbarContainer>
      <NavList>
        <NavItem>
          <NavLink to="/">Home</NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/profile">Profile</NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/game">Play</NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/stats">Stats</NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/leaderboard">Leaderboard</NavLink>
        </NavItem>
      </NavList>
    </NavbarContainer>
  );
};

export default Navbar;
