import React, { useState } from 'react';

interface SignInProps {
  onSignIn: (username: string, password: string) => void;
}


function SignIn({ onSignIn }: SignInProps) {
  const formStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      //minHeight: '100vh' /* Optional: Ensure the container takes up the full viewport height */
  };

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSignIn(username, password);
    setUsername('');
    setPassword('');
  }

  return (
    <div style={formStyle}>
      <h1 style={{fontFamily:'Arial Black', fontSize: '36px', color: 'white'}}>Pong Game</h1>
      <img src="/assets/school_42.jpeg" alt='42 logo' style={{width: '150px', marginBottom: '12px'}} />
      <form onSubmit={handleSubmit}>
        <div style={{width: '150px', marginBottom: '20px'}}>
          <label htmlFor="username"></label>
          <input
            type="text"
            placeholder='username'
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div style={{width: '150px', marginBottom: '20px'}}>
          <label htmlFor="password"></label>
          <input
            type="password"
            placeholder='password'
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button style={{width: '175px'}} type="submit">Sign In</button>
      </form>
    </div>
  );
}

export default SignIn;
