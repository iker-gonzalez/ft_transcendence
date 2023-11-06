import React, { useRef } from 'react';
import styled from 'styled-components';
import { darkestBgColor, darkerBgColor } from '../../constants/color-tokens';
import { sm } from '../../constants/styles';
import ButtonAnimationData from '../../assets/lotties/menu-button.json';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import NavigationLinks from './NavigationLinks';
import Logo42 from '../../assets/svg/logo_42.svg';

const MENU_BUTTON_FRAMES = 140;
const ANIMATION_DURATION = 0.5;

const NavBarContainerMobile = styled.div`
  @media (width > ${sm}) {
    display: none;
  }

  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 100vw;
  min-height: 100vh;
  height: 100%;

  z-index: 100;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 15px 15px;

    background: ${darkestBgColor};
    box-shadow: rgba(0, 173, 181, 0.09) 0px 2px 1px,
      rgba(0, 173, 181, 0.09) 0px 4px 2px, rgba(0, 173, 181, 0.09) 0px 8px 4px,
      rgba(0, 173, 181, 0.09) 0px 16px 8px,
      rgba(0, 173, 181, 0.09) 0px 32px 16px;

    .menu-icon {
      width: 30px;
      object-fit: contain;
      cursor: pointer;
    }

    .logo {
      width: 30px;
      object-fit: contain;
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

  .sidebar-inner,
  .sidebar-bg {
    animation-duration: ${ANIMATION_DURATION}s;
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

const NavbarContainerDesktop = styled.nav`
  @media (width <= ${sm}) {
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
  }
`;

const Navbar = (): JSX.Element => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState<boolean>(false);
  const [isLottiePlay, setIsLottiePlay] = React.useState<boolean>(false);
  const [isAnimationPlaying, setIsAnimationPlaying] =
    React.useState<boolean>(false);
  const menuButtonRef = useRef<LottieRefCurrentProps>(null);

  const startClosingAnimation = () => {
    setIsAnimationPlaying(true);
    setTimeout(() => {
      setIsAnimationPlaying(false);
    }, ANIMATION_DURATION * 1000);
  };

  return (
    <>
      <NavBarContainerMobile>
        <div className="header">
          <Lottie
            animationData={ButtonAnimationData}
            loop={false}
            autoplay={false}
            onSegmentStart={() => {
              setIsLottiePlay(true);
            }}
            onComplete={() => {
              setIsLottiePlay(false);
            }}
            onClick={() => {
              if (menuButtonRef.current && !isLottiePlay) {
                setIsSidebarOpen((prevState) => {
                  if (prevState === true) startClosingAnimation();

                  return !prevState;
                });

                const midFrame = MENU_BUTTON_FRAMES / 2;
                if (!isSidebarOpen) {
                  menuButtonRef.current.playSegments([0, midFrame]);
                } else {
                  menuButtonRef.current.playSegments([
                    midFrame,
                    MENU_BUTTON_FRAMES,
                  ]);
                }
              }
            }}
            lottieRef={menuButtonRef}
            className="menu-icon"
          />
          <img src={Logo42} alt="" className="logo" />
        </div>
        {(isSidebarOpen || (!isSidebarOpen && isAnimationPlaying)) && (
          <div className="sidebar">
            <div
              className={`sidebar-inner animate__animated ${
                isSidebarOpen && 'animate__slideInLeft'
              } ${isAnimationPlaying && 'animate__slideOutLeft'}`}
            >
              <NavigationLinks
                className="nav-list"
                onClickLink={() => {
                  setIsSidebarOpen(false);
                  startClosingAnimation();
                }}
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
