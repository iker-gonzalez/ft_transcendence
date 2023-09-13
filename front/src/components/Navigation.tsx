import React from 'react';
import styled from 'styled-components';

// Define styled components
const NavbarContainer = styled.nav`
  background-color: #393E46;
  color: #fff;
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

const NavLink = styled.a`
  text-decoration: none;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  transition: color 0.3s ease-in-out;

  &:hover {
    color: #00adb5; /* Change color on hover */
  }
`;

const Navbar = () => {
  return (
    <NavbarContainer>
      <NavList>
        <NavItem>
          <NavLink href="/">Home</NavLink>
        </NavItem>
        <NavItem>
          <NavLink href="/stats">Stats</NavLink>
        </NavItem>
        <NavItem>
          <NavLink href="/profile">Profile</NavLink>
        </NavItem>
        <NavItem>
          <NavLink href="/game">Game</NavLink>
        </NavItem>
      </NavList>
    </NavbarContainer>
  );
};

export default Navbar;
