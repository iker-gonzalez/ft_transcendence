import React from 'react';
import { getUrlWithRelativePath } from '../utils/utils';
import MainButton from "../components/UI/MainButton";
import { styled } from "styled-components";
import { useNavigate } from 'react-router-dom';

const PageWrapperDiv = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

function SignIn() {
  const [message, setMessage] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignInClick = () => {
    // Redirect the user to the intranet URL
    window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-823d4a335c6215d2862f2791ca0cbeed1008279abd69da67dba4ff537b0a6105&redirect_uri=https%3A%2F%2Fsymmetrical-carnival-wj7r59qxprg2grj-4200.app.github.dev%2Flogin&response_type=code`;
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
      </form>
      {message && <p>{message}</p>}
    </PageWrapperDiv>
  );
}

export default SignIn;
