import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HomeIcon from '../../assets/svg/home-icon.svg';

import SVG from 'react-inlinesvg';
import { useUserData } from '../../context/UserDataContext';
import styled from 'styled-components';
import {
  primaryAccentColor,
  primaryLightColor,
} from '../../constants/color-tokens';
import MainButton from './MainButton';
import Cookies from 'js-cookie';
import { patchUserStatus } from '../../utils/utils';
import UserStatus from '../../interfaces/user-status.interface';
import { NAVIGATION_LINKS } from './navigation-links';
import { useFlashMessages } from '../../context/FlashMessagesContext';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import LogOutIcon from '../../assets/svg/log-out.svg';
import Modal from './Modal';
import SecondaryButton from './SecondaryButton';

type NavigationLinksProps = {
  className?: string;
  onClickLink?: () => void;
  setIsSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
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

  .logout-button {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;

    > img {
      width: 20px;
      object-fit: contain;
    }
  }
`;

const LogOutModal = styled(Modal)`
  .actions-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }
`;

const NavigationLinks: React.FC<NavigationLinksProps> = ({
  className,
  onClickLink,
  setIsSidebarOpen,
}): JSX.Element => {
  const { userData, setUserData } = useUserData();
  const navigate = useNavigate();
  const { launchFlashMessage } = useFlashMessages();

  const [navigationLinks, setNavigationLinks] =
    React.useState(NAVIGATION_LINKS);
  const [isLogged, setIsLogged] = React.useState<boolean>(!!userData);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  useEffect(() => {}, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setIsLogged(!!userData);

    if (!userData) {
      const homeNavigationLink = {
        to: '/',
        isPermanent: true,
        icon: HomeIcon,
        text: 'Home',
        id: 'home',
      };
      setNavigationLinks([homeNavigationLink, ...NAVIGATION_LINKS]);
    } else {
      setNavigationLinks(NAVIGATION_LINKS);
    }
  }, [userData]);

  const logOutUser = (): void => {
    patchUserStatus(UserStatus.OFFLINE);
    Cookies.remove('token');
    setUserData(null);
    sessionStorage.clear();

    if (setIsSidebarOpen) setIsSidebarOpen(false);
    navigate('/');
    launchFlashMessage('Logged out successfully', FlashMessageLevel.SUCCESS);
  };

  return (
    <StyledNav className={`nav-list ${className}`}>
      {navigationLinks.map((link) => {
        return (
          <Link
            key={link.id}
            to={link.to}
            className={`${
              !link.isPermanent && !isLogged ? 'disabled' : ''
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
      {userData && (
        <MainButton
          onClick={() => {
            setIsLogoutModalOpen(true);
          }}
          className="logout-button"
          key="login"
          arial-label="Log out"
        >
          Log out <img src={LogOutIcon} alt="" />
        </MainButton>
      )}
      {isLogoutModalOpen && (
        <LogOutModal
          dismissModalAction={() => {
            setIsLogoutModalOpen(false);
          }}
        >
          <h1 className="title-1 mb-16">Confirm logout?</h1>
          <p className="mb-24">
            You will be logged out from the application, but you 42 Intra
            session will remain active. If someone is using the same device
            after you, remember to log out from the 42 Intra as well.
          </p>
          <div className="actions-container">
            <SecondaryButton
              onClick={() => {
                setIsLogoutModalOpen(false);
              }}
            >
              Cancel
            </SecondaryButton>
            <MainButton
              onClick={() => {
                logOutUser();
                setIsLogoutModalOpen(false);
              }}
            >
              Confirm
            </MainButton>
          </div>
        </LogOutModal>
      )}
    </StyledNav>
  );
};

export default NavigationLinks;
