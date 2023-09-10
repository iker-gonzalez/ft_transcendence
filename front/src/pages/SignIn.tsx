import React, { useState } from 'react';
import {getBaseUrl} from '../utils/utils';
import { useNavigate } from 'react-router-dom';

const formStyle: React.CSSProperties = {
  position: 'fixed',
  top: '40%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
};

const buttonStyles = {
  width: '175px',
  height: '50px',
  backgroundColor: '#FFD369',
  color: 'black',
  borderRadius: '5px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 'bold',
  boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
};

function SignIn() {
  const [intraCodeValue, setIntraCodeValue] = useState("123456");
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

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

        navigate("/set-profile");
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
    <div style={formStyle}>
      <h1 style={{ fontFamily: 'Arial Black', fontSize: '36px'}}>Pong Game</h1>
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
        <button style={buttonStyles} type="submit">Sign In with 42</button>
      </form>
      <p>
        Currently, we support <span style={{ color: "yellow" }}>123456</span>{" "}
        and <span style={{ color: "yellow" }}>111111</span> test users.
      </p>
      {message && <p>{message}</p>}
    </div>
  );
}

export default SignIn;
