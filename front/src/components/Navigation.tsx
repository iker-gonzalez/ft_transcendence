import React, { useEffect } from 'react';
import styled from 'styled-components';
import {
  primaryLightColor,
  primaryAccentColor,
  darkestBgColor,
} from '../constants/color-tokens';
import { Link } from 'react-router-dom';
import { useUserData } from '../context/UserDataContext';
import HomeIcon from '../assets/svg/home-icon.svg';
import ProfileIcon from '../assets/svg/profile-icon.svg';
import PlayIcon from '../assets/svg/play-icon.svg';
import StatsIcon from '../assets/svg/stats-icon.svg';
import LeaderboardIcon from '../assets/svg/leaderboard-icon.svg';
import SVG from 'react-inlinesvg';

const NavbarContainer = styled.nav`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  z-index: 100;

  padding: 25px 30px;
  background: ${darkestBgColor};
  box-shadow: rgba(0, 173, 181, 0.45) 0px 25px 20px -20px;

  .nav-list {
    padding: 0;

    gap: 45px;

    max-width: 1000px;
    margin: 0 auto;

    display: flex;
    justify-content: center;
    align-items: center;

    > :first-child {
      margin-right: auto;
    }

    > :last-child {
      margin-left: auto;
    }

    .link {
      text-decoration: none;
      color: ${primaryLightColor};
      font-size: 18px;
      font-weight: bold;

      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;

      transition: color 0.3s ease-in-out;

      &.disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      &:hover:not(.disabled) {
        color: ${primaryAccentColor};

        .icon path {
          fill: ${primaryAccentColor};
        }
      }

      .icon {
        width: 17px;
        height: auto;

        path {
          fill: ${primaryLightColor};
          transition: fill 0.3s ease-in-out;
        }
      }
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
    <NavbarContainer className="animate__animated animate__slideInDown">
      <nav className="nav-list">
        <Link to="/" className="link">
          <SVG src={HomeIcon} aria-hidden="true" className="icon" />
          Home
        </Link>
        <Link
          to="/profile"
          onClick={disableLink}
          className={`${!isLogged && 'disabled'} link`}
        >
          <SVG src={ProfileIcon} aria-hidden="true" className="icon" />
          Profile
        </Link>
        <Link
          to="/game"
          onClick={disableLink}
          className={`${!isLogged && 'disabled'} link`}
        >
          <SVG src={PlayIcon} aria-hidden="true" className="icon" />
          Play
        </Link>
        <Link
          to="/stats"
          onClick={disableLink}
          className={`${!isLogged && 'disabled'} link`}
        >
          <SVG src={StatsIcon} aria-hidden="true" className="icon" />
          Stats
        </Link>
        <Link to="/leaderboard" className="link">
          <SVG src={LeaderboardIcon} aria-hidden="true" className="icon" />
          Leaderboard
        </Link>
      </nav>
    </NavbarContainer>
  );
};

export default Navbar;
