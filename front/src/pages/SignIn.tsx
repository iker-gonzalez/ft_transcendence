import React, { useState, useEffect } from 'react';
import { getBaseUrl } from '../utils/utils';
import { useNavigate } from 'react-router-dom';
import MainButton from "../components/UI/MainButton";
import { styled } from "styled-components";

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
  const [intraCodeValue, setIntraCodeValue] = useState("123456");
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      // Code has been received from the redirected URL, use it
      setIntraCodeValue(code);
    }
  }, []);

  const handleSignInClick = () => {
    // Redirect the user to the intranet URL
    window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-74ad9c2d9b47a3981f7a3e1c602472165f4956ddfff7109409f90e46df0d8f81&redirect_uri=${getBaseUrl()}/profile&response_type=code`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${getBaseUrl()}/auth/intra/signin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add authentication headers if needed
          },
          body: JSON.stringify({
            code: intraCodeValue,
            state: "oI7a4edGeu8kamVFhYkJqF2EWu2zFk9A",
          }),
        }
      );

      if (response.ok) {
        // TODO use a better system to store user's intraId
        // e.g. use a cookie or a store
        const data = await response.json();
        console.log(data);
        sessionStorage.setItem("intraId", data.data.intraId);

        navigate("/profile");
      } else {
        const errorData = await response.json().catch(() => ({})); // Handle potential non-JSON responses
        const errorMessage = errorData.message || 'An error occurred on the server.';
        setMessage(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setMessage(`An error occurred while processing your request: ${error}`);
    }
  };

  const onCodeInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIntraCodeValue(event.target.value);
  };

  return (
    <PageWrapperDiv>
      <h1 style={{ fontFamily: 'Arial Black', fontSize: '36px' }}>Pong Game</h1>
      <img src="/assets/school_42.jpeg" alt='42 logo' style={{ width: '150px', marginBottom: '12px' }} />
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        <label>
          IntraId code:
          <input
            type="text"
            placeholder="123456"
            maxLength={6}
            value={intraCodeValue}
            onChange={onCodeInputChange}
            style={{ marginLeft: "10px" }}
          />
        </label>
        <MainButton type="button" onClick={handleSignInClick}>
          Sign In with 42
        </MainButton>
      </form>
      <p>
        Currently, we support <span style={{ color: "yellow" }}>123456</span>{" "}
        and <span style={{ color: "yellow" }}>111111</span> test users.
      </p>
      {message && <p>{message}</p>}
    </PageWrapperDiv>
  );
}

export default SignIn;
