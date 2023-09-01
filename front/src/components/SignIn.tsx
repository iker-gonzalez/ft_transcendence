import React, { useState } from 'react';

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
};

function SignIn() {
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new URLSearchParams();
    formData.append('state', 'oI7a4edGeu8kamVFhYkJqF2EWu2zFk9A');
    formData.append('code', '111111');

    const url = 'https://localhost:3000/auth/intra/signin';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          // Add authentication headers if needed
        },
        body: formData.toString(),
      });

      if (response.ok) {
        setMessage('Login successful');
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
      <h1 style={{ fontFamily: 'Arial Black', fontSize: '36px', color: 'white' }}>Pong Game</h1>
      <img src="/assets/school_42.jpeg" alt='42 logo' style={{ width: '150px', marginBottom: '12px' }} />
      <form onSubmit={handleSubmit}>
        <button style={{ width: '175px' }} type="submit">Sign In with 42</button>
      </form>
      {message && <p style={{ color: 'white' }}>{message}</p>}
    </div>
  );
}

export default SignIn;
