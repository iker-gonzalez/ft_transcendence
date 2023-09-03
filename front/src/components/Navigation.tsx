import React from 'react';

const navbarStyles = {
  backgroundColor: '#393E46',
  color: '#fff',
  padding: '10px 0',
  boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
};

const navListStyles = {
  listStyle: 'none',
  padding: '0',
  display: 'flex',
  justifyContent: 'center', // Center-align menu items
};

const navItemStyles = {
  margin: '0 20px',
};

const navLinkStyles = {
  textDecoration: 'none',
  color: '#fff',
  fontSize: '18px', // Increase font size
  fontWeight: 'bold',
  transition: 'color 0.3s ease-in-out', // Add color transition
};

const Navbar = () => {
  return (
    <nav style={navbarStyles}>
      <ul style={navListStyles}>
        <li style={navItemStyles}>
          <a href="/" style={navLinkStyles}>Home</a>
        </li>
        <li style={navItemStyles}>
          <a href="/stats" style={navLinkStyles}>Stats</a>
        </li>
        <li style={navItemStyles}>
          <a href="/profile" style={navLinkStyles}>Profile</a>
        </li>
        <li style={navItemStyles}>
          <a href="/game" style={navLinkStyles}>Game</a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
