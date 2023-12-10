import React from 'react';
import styled from 'styled-components';
import { darkestBgColor, darkerBgColor } from '../../constants/color-tokens';
import { md } from '../../constants/styles';
import NavigationLinks from './NavigationLinks';
import OpenMenuIcon from '../../assets/svg/menu-open.svg';
import CloseMenuIcon from '../../assets/svg/menu-close.svg';

const NavBarContainerMobile = styled.div`
  @media (width > ${md}) {
    display: none;
  }

  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 100vw;
  height: fit-content;
  z-index: 100;

  .header {
    padding: 15px 15px;

    background: ${darkestBgColor};
    box-shadow: rgba(0, 173, 181, 0.09) 0px 2px 1px,
      rgba(0, 173, 181, 0.09) 0px 4px 2px, rgba(0, 173, 181, 0.09) 0px 8px 4px,
      rgba(0, 173, 181, 0.09) 0px 16px 8px,
      rgba(0, 173, 181, 0.09) 0px 32px 16px;

    .menu-button {
      padding: 0;
      .menu-icon {
        width: 30px;
        object-fit: contain;
      }
    }
  }

  .sidebar {
    position: relative;
  }

  .sidebar-bg {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;

    width: 100vw;
    height: 100%;
    z-index: -1;

    backdrop-filter: blur(7px);
  }

  .sidebar-inner {
    padding: 50px 15px;

    background-color: ${darkerBgColor};

    max-width: 75vw;
    height: 100vh;

    .nav-list {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      gap: 60px;

      font-size: 1.2rem;
    }
  }
`;

const NavbarContainerDesktop = styled.div`
  @media (width <= ${md}) {
    display: none;
  }

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

    gap: 30px;

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
  }
`;

const Navbar = (): JSX.Element => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState<boolean>(false);

  return (
    <>
      <NavBarContainerMobile>
        <div className="header">
          <button
            className="menu-button"
            onClick={() => {
              setIsSidebarOpen((prevState) => !prevState);
            }}
          >
            <img
              src={isSidebarOpen ? CloseMenuIcon : OpenMenuIcon}
              alt=""
              className="menu-icon"
            />
          </button>
        </div>
        {isSidebarOpen && (
          <div className="sidebar">
            <div
              className={`sidebar-inner animate__animated ${
                isSidebarOpen && 'animate__slideInLeft'
              }`}
            >
              <NavigationLinks
                className="nav-list"
                onClickLink={() => {
                  setIsSidebarOpen(false);
                }}
                setIsSidebarOpen={setIsSidebarOpen}
              />
            </div>
            <div className="sidebar-bg animate__animated animate__fadeIn"></div>
          </div>
        )}
      </NavBarContainerMobile>
      <NavbarContainerDesktop className="animate__animated animate__slideInDown">
        <NavigationLinks className="nav-list" />
      </NavbarContainerDesktop>
    </>
  );
};

export default Navbar;
