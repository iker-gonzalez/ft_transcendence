import React, { useEffect } from 'react';
import MainButton from '../components/UI/MainButton';
import { styled } from 'styled-components';
import { Link } from 'react-router-dom';
import {
  darkestBgColor,
  primaryAccentColor,
  primaryLightColor,
} from '../constants/color-tokens';
import { useUserData } from '../context/UserDataContext';
import Cookies from 'js-cookie';
import UserDataContextData from '../interfaces/user-data-context-data.interface';
import LoadingFullscreen from '../components/UI/LoadingFullscreen';
import teamImage from '../assets/images/team.png';
import logo42 from '../assets/svg/logo_42.svg';
import CenteredLayout from '../components/UI/CenteredLayout';
import { patchUserStatus } from '../utils/utils';
import UserStatus from '../interfaces/user-status.interface';
import RoundImg from '../components/UI/RoundImage';
import { TEST_USERS_DATA } from '../constants/shared';
import NET from 'vanta/src/vanta.net';
import { sm } from '../constants/styles';

const VantaBg = styled.div`
  opacity: 0.2;

  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: -1;

  min-height: 100vh;
  height: 100%;
  min-width: 100vw;
  width: 100%;

  overflow: hidden;
`;

const PageWrapperDiv = styled.div`
  min-height: 100vh;

  position: relative;

  .logo {
    width: 75px;
    @media (width > ${sm}) {
      width: 100px;
    }

    margin-bottom: 30px;
  }

  .signin-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;

    text-align: center;

    .links-container {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
    }

    .signin-link {
      color: ${primaryLightColor};
      text-decoration: none;
      cursor: pointer;

      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 8px;

      > img {
        width: 75px;
        object-fit: contain;
      }
    }
  }

  .team-image {
    width: 100%;
    max-width: min(300px, 75vw);

    margin-bottom: 50px;
    border-radius: 50px;
  }

  .text-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    text-align: center;

    width: 100%;
    max-width: 550px;
  }
`;

const SignIn: React.FC = (): JSX.Element => {
  const {
    userData,
    setUserData,
    fetchUserData,
    isUserDataFetching,
  }: UserDataContextData = useUserData();

  useEffect(() => {
    const token: string | undefined = Cookies.get('token');

    if (!token) {
      // If there is no token, the user is not logged in
      setUserData(null);
    } else {
      // User data is not set, but session is still active
      if (!userData) {
        fetchUserData(token);
      }
    }

    // Vanta interactive background
    NET({
      el: '#vanta',
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      scale: 1,
      scaleMobile: 0.75,
      backgroundColor: darkestBgColor,
      color: primaryAccentColor,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignIn = () => {
    // Redirect the user to the intranet URL
    window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.REACT_APP_INTRA_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_INTRA_AUTH_REDIRECT_URI}&response_type=code`;
  };

  return (
    <PageWrapperDiv>
      <VantaBg id="vanta" />
      <CenteredLayout>
        {(() => {
          if (isUserDataFetching) return <LoadingFullscreen />;

          return (
            <>
              <img src={logo42} alt="" className="logo" />

              <div className="mb-24 text-container">
                <h1 className="title-1 mb-24">
                  Welcome to our ft_transcendence project
                </h1>
                <img src={teamImage} alt="" className="team-image" />
                <p className="mb-8">
                  We are{' '}
                  <a
                    href="https://profile.intra.42.fr/users/dgerwig-"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="body-link"
                  >
                    dgerwig-
                  </a>
                  ,{' '}
                  <a
                    href="https://profile.intra.42.fr/users/ikgonzal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="body-link"
                  >
                    ikgonzal
                  </a>
                  ,{' '}
                  <a
                    href="https://profile.intra.42.fr/users/ngasco"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="body-link"
                  >
                    ngasco
                  </a>
                  , and{' '}
                  <a
                    href="https://profile.intra.42.fr/users/zcanales"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="body-link"
                  >
                    zcanales
                  </a>
                  ,<br />
                  students of the 42Urduliz campus in Bilbao, Spain
                </p>
                <p className="mb-8">Go ahead and explore our project 🤠</p>
              </div>
              {userData ? (
                <div>
                  <MainButton
                    onClick={() => {
                      patchUserStatus(UserStatus.OFFLINE);
                      Cookies.remove('token');
                      setUserData(null);
                      sessionStorage.clear();
                    }}
                  >
                    Log out
                  </MainButton>
                </div>
              ) : (
                <div className="signin-container">
                  <MainButton type="button" onClick={handleSignIn}>
                    Sign In with 42
                  </MainButton>
                  <div>
                    <p className="mb-8">
                      Or sign in with one of our ready-made test users
                    </p>
                    <div className="links-container">
                      {TEST_USERS_DATA.map((testUser, index) => {
                        return (
                          <Link
                            to={`login?code=${testUser.code}`}
                            className="signin-link"
                            key={testUser.code}
                          >
                            <RoundImg src={testUser.avatar} alt="" />
                            User {index + 1}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </CenteredLayout>
    </PageWrapperDiv>
  );
};

export default SignIn;
