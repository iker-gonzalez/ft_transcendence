import React from 'react';
import { getRedirectUri } from '../utils/utils';
import MainButton from "../components/UI/MainButton";
import { styled } from "styled-components";
import { Link, useNavigate } from 'react-router-dom';

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
    color: white;
    text-decoration: underline;
    cursor: pointer;
  }
`;

function SignIn() {
  const [message, setMessage] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignInClick = () => {
    // Redirect the user to the intranet URL
    window.location.href = getRedirectUri();
  };

  return (
    <PageWrapperDiv>
      <h1 style={{ fontFamily: 'Arial Black', fontSize: '36px' }}>Pong Game</h1>
      <img src="/assets/school_42.jpeg" alt='42 logo' style={{ width: '150px', marginBottom: '12px' }} />
      <form
        onSubmit={(e) => e.preventDefault()} // Prevent form submission
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        <MainButton type="button" onClick={handleSignInClick}>
          Sign In with 42
        </MainButton>
        <Link to={`login?code=${process.env.REACT_APP_USER_TEST_1_CODE}`} className="signin-link">Sign in with test user 1</Link>
        <Link to={`login?code=${process.env.REACT_APP_USER_TEST_2_CODE}`} className="signin-link">Sign in with test user 2</Link>
      </form>
      {message && <p>{message}</p>}
    </PageWrapperDiv>
  );
}

export default SignIn;
