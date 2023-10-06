import React, { useEffect } from 'react';
import MainButton from '../components/UI/MainButton';
import { styled } from 'styled-components';
import { Link } from 'react-router-dom';
import { primaryLightColor } from '../constants/color-tokens';
import { useUserData } from '../context/UserDataContext';
import Cookies from 'js-cookie';
import UserDataContextData from '../interfaces/user-data-context-data.interface';
import LoadingPage from './LoadingPage';

const PageWrapperDiv = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .logo {
    width: 150px;
    margin-bottom: 12px;
  }

  .links-container {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .signin-link {
      color: ${primaryLightColor};
      text-decoration: underline;
      cursor: pointer;
    }
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignIn = () => {
    // Redirect the user to the intranet URL
    window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.REACT_APP_INTRA_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_INTRA_AUTH_REDIRECT_URI}&response_type=code`;
  };

  const handleLogOut = () => {
    Cookies.remove('token');
    setUserData(null);
    window.location.reload();
  };

  return (
    <PageWrapperDiv>
      {(() => {
        if (isUserDataFetching) return <LoadingPage />;

        return (
          <>
            <h1 className="title-1">Pong Game</h1>
            <img src="/assets/school_42.png" alt="" className="logo" />
            {userData ? (
              <>
                <h2 className="title-2">Hello, {userData.username}!</h2>
                <MainButton onClick={handleLogOut}>Log out</MainButton>
              </>
            ) : (
              <div className="links-container">
                <MainButton type="button" onClick={handleSignIn}>
                  Sign In with 42
                </MainButton>
                <Link
                  to={`login?code=${process.env.REACT_APP_USER_TEST_1_CODE}`}
                  className="signin-link"
                >
                  Sign in with test user 1
                </Link>
                <Link
                  to={`login?code=${process.env.REACT_APP_USER_TEST_2_CODE}`}
                  className="signin-link"
                >
                  Sign in with test user 2
                </Link>
              </div>
            )}
          </>
        );
      })()}
    </PageWrapperDiv>
  );
};

export default SignIn;
