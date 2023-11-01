import React, { useEffect } from 'react';
import styled from 'styled-components';
import {
  primaryLightColor,
  primaryAccentColor,
} from '../constants/color-tokens';
import { Link } from 'react-router-dom';
import { useUserData } from '../context/UserDataContext';
import HomeIcon from '../assets/svg/home-icon.svg';
import ProfileIcon from '../assets/svg/profile-icon.svg';
import PlayIcon from '../assets/svg/play-icon.svg';
import StatsIcon from '../assets/svg/stats-icon.svg';
import LeaderboardIcon from '../assets/svg/leaderboard-icon.svg';
import LockIcon from '../assets/svg/lock-icon.svg';
import SVG from 'react-inlinesvg';

const NavbarContainer = styled.nav`
  color: ${primaryLightColor};
  padding: 25px 30px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);

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

        &:not(.lock-icon) path {
          fill: ${primaryLightColor};
          transition: fill 0.3s ease-in-out;
        }

        &.lock-icon path {
          stroke: ${primaryLightColor};
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
        {[
          { to: '/profile', text: 'Profile', icon: ProfileIcon },
          { to: '/game', text: 'Play', icon: PlayIcon },
          { to: '/stats', text: 'Stats', icon: StatsIcon },
        ].map((item) => {
          return (
            <Link
              to={item.to}
              onClick={disableLink}
              className={`${!isLogged && 'disabled'} link`}
            >
              {isLogged ? (
                <SVG src={item.icon} aria-hidden="true" className="icon" />
              ) : (
                <SVG
                  src={LockIcon}
                  aria-hidden="true"
                  className="icon lock-icon"
                />
              )}
              {item.text}
            </Link>
          );
        })}

        <Link to="/leaderboard" className="link">
          <SVG src={LeaderboardIcon} aria-hidden="true" className="icon" />
          Leaderboard
        </Link>
      </nav>
    </NavbarContainer>
  );
};

export default Navbar;
