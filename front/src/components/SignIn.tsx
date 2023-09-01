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
        <button style={{width: '175px'}} type="submit">Sign In with 42</button>
      </form>
    </div>
  );
}

export default SignIn;
