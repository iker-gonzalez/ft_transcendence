import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import HomeIcon from '../../assets/svg/home-icon.svg';
import ProfileIcon from '../../assets/svg/profile-icon.svg';
import PlayIcon from '../../assets/svg/play-icon.svg';
import StatsIcon from '../../assets/svg/stats-icon.svg';
import LeaderboardIcon from '../../assets/svg/leaderboard-icon.svg';
import SVG from 'react-inlinesvg';
import { useUserData } from '../../context/UserDataContext';
import styled from 'styled-components';
import {
  primaryAccentColor,
  primaryLightColor,
} from '../../constants/color-tokens';

type NavigationLinksProps = {
  className?: string;
  onClickLink?: () => void;
};

const StyledNav = styled.nav`
  .link {
    text-decoration: none;
    color: ${primaryLightColor};
    font-size: inherit;
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
`;

const NavigationLinks: React.FC<NavigationLinksProps> = ({
  className,
  onClickLink,
}): JSX.Element => {
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

    if (onClickLink) {
      onClickLink();
    }
  };

  return (
    <StyledNav className={`nav-list ${className}`}>
      <Link
        to="/"
        className="link"
        onClick={() => {
          if (onClickLink) {
            onClickLink();
          }
        }}
      >
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
          to="/chat"
          onClick={disableLink}
          className={`${!isLogged && 'disabled'} link`}
        >
        <SVG src={PlayIcon} aria-hidden="true" className="icon" />
        Chat
      </Link>
      <Link
        to="/stats"
        onClick={disableLink}
        className={`${!isLogged && 'disabled'} link`}
      >
        <SVG src={StatsIcon} aria-hidden="true" className="icon" />
        Stats
      </Link>
      <Link
        to="/leaderboard"
        className="link"
        onClick={() => {
          if (onClickLink) {
            onClickLink();
          }
        }}
      >
        <SVG src={LeaderboardIcon} aria-hidden="true" className="icon" />
        Leaderboard
      </Link>
    </StyledNav>
  );
};

export default NavigationLinks;
