import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import HomeIcon from '../../assets/svg/home-icon.svg';
import ProfileIcon from '../../assets/svg/profile-icon.svg';
import PlayIcon from '../../assets/svg/play-icon.svg';
import StatsIcon from '../../assets/svg/stats-icon.svg';
import ChatIcon from '../../assets/svg/chat-icon.svg';
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
  isAnimationPlaying?: boolean;
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
      pointer-events: none;
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
  isAnimationPlaying,
}): JSX.Element => {
  const { userData } = useUserData();

  const [isLogged, setIsLogged] = React.useState<boolean>(!!userData);

  useEffect(() => {
    setIsLogged(!!userData);
  }, [userData]);

  const links: {
    to: string;
    isPermanent: boolean;
    icon: string;
    text: string;
    id: string;
  }[] = [
    { to: '/', isPermanent: true, icon: HomeIcon, text: 'Home', id: 'home' },
    {
      to: '/profile',
      isPermanent: false,
      icon: ProfileIcon,
      text: 'Profile',
      id: 'profile',
    },
    {
      to: '/game',
      isPermanent: false,
      icon: PlayIcon,
      text: 'Play',
      id: 'game',
    },
    {
      to: '/chat',
      isPermanent: false,
      icon: ChatIcon,
      text: 'Chat',
      id: 'chat',
    },
    {
      to: '/stats',
      isPermanent: false,
      icon: StatsIcon,
      text: 'Stats',
      id: 'stats',
    },
    {
      to: '/leaderboard',
      isPermanent: true,
      icon: LeaderboardIcon,
      text: 'Leaderboard',
      id: 'leader',
    },
  ];

  return (
    <StyledNav className={`nav-list ${className}`}>
      {links.map((link) => {
        return (
          <Link
            key={link.id}
            to={link.to}
            className={`${
              !link.isPermanent &&
              (!isLogged || isAnimationPlaying) &&
              'disabled'
            } link`}
            onClick={(e) => {
              if (!link.isPermanent) {
                if (!isLogged) {
                  e.preventDefault();
                  return;
                }
              }

              if (onClickLink) {
                onClickLink();
              }
            }}
          >
            <SVG src={link.icon} aria-hidden="true" className="icon" />
            {link.text}
          </Link>
        );
      })}
    </StyledNav>
  );
};

export default NavigationLinks;
