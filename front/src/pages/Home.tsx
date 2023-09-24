import React, { useEffect, useState } from 'react';
import { getRedirectUri } from '../utils/utils';
import MainButton from '../components/UI/MainButton';
import { styled } from 'styled-components';
import { Link } from 'react-router-dom';
import { primaryLightColor } from '../constants/color-tokens';
import { useRefetchUserData, useUserData } from '../context/UserDataContext';
import UserData from '../interfaces/user-data.interface';
import Cookies from 'js-cookie';
import UserDataContextData from '../interfaces/user-data-context-data.interface';

const PageWrapperDiv = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .signin-link {
    color: ${primaryLightColor};
    text-decoration: underline;
    cursor: pointer;
  }
`;

function SignIn() {
  const { userData, setUserData }: UserDataContextData = useUserData();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const refetchUserData = useRefetchUserData();

  useEffect(() => {
    const token: string = Cookies.get('token') || '';
    // User data is not set, but section is still active
    if (!userData && token.length) {
      refetchUserData(token)
        .then((userData: UserData | null) => {
          setUserData(userData);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error on Home page:', error);
          setIsLoading(false);
          setIsError(true);
        });
    } else {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignInClick = () => {
    // Redirect the user to the intranet URL
    window.location.href = getRedirectUri();
  };

  const handleUserLogOut = () => {
    Cookies.remove('token');
    setUserData(null);
  };

  return (
    <PageWrapperDiv>
      {(() => {
        if (isError) return <p>An error occurred...</p>;

        if (isLoading) return <p>Loading...</p>;

        return (
          <>
            <h1 className="title-1">Pong Game</h1>
            <img
              src="/assets/school_42.png"
              alt="42 logo"
              style={{ width: '150px', marginBottom: '12px' }}
            />
            {userData ? (
              <>
                <h2 className="title-2">Hello, {userData.username}!</h2>
                <MainButton onClick={handleUserLogOut}>Log out</MainButton>
              </>
            ) : (
              <form
                onSubmit={(e) => e.preventDefault()} // Prevent form submission
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}
              >
                <MainButton type="button" onClick={handleSignInClick}>
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
              </form>
            )}
          </>
        );
      })()}
    </PageWrapperDiv>
  );
}

export default SignIn;
