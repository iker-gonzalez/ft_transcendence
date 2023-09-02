import React, { useState } from 'react';
import {getBaseUrl} from '../utils/utils';
import { useNavigate } from 'react-router-dom';


const formStyle: React.CSSProperties = {
  position: 'fixed',
  top: '40%',
  left: '50%',
  transform: 'translate(-50%, -50%)'
};

function SignIn() {
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
            code: "111111",
            state: "oI7a4edGeu8kamVFhYkJqF2EWu2zFk9A",
          }),
        }
      );

      if (response.ok) {
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

  return (
    <div style={formStyle}>
      <h1 style={{ fontFamily: 'Arial Black', fontSize: '36px'}}>Pong Game</h1>
      <img src="/assets/school_42.jpeg" alt='42 logo' style={{ width: '150px', marginBottom: '12px' }} />
      <form onSubmit={handleSubmit}>
        <button style={{ width: '175px' }} type="submit">Sign In with 42</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default SignIn;
