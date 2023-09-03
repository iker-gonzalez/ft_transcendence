import React, { useState } from 'react';

const formStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
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
    backgroundColor: 'gold',
    color: 'black',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
    marginTop: '30px'
  };

function SetProfile() {
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false); // State for enabling 2FA

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedAvatar = e.target.files && e.target.files[0];
    setAvatar(selectedAvatar || null);
  };

  const handleTwoFactorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTwoFactorEnabled(e.target.checked);
  };

  const handleCreate = () => {
    // Handle the "Create" button click here
    // Send the selected avatar, username, and isTwoFactorEnabled to backend.
  };

  return (
    <div style={formStyle}>
      <h2 style={{ fontFamily: 'Arial', fontSize: '30px'}}>Choose your username</h2>
      <div style={{ width: '150px', marginBottom: '20px' }}>
        <label htmlFor="username"></label>
        <input
          type="text"
          placeholder="username"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <h2 style={{ fontFamily: 'Arial', fontSize: '30px'}}>Choose your avatar</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
      />
      {avatar && (
        <img
          src={URL.createObjectURL(avatar)}
          alt="Selected Avatar"
          style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px' }}
        />
      )}
      <div style={{ marginTop: '20px' }}>
        <label>
          Enable Two-Factor Authentication
          <input
            type="checkbox"
            checked={isTwoFactorEnabled}
            onChange={handleTwoFactorChange}
          />
        </label>
      </div>
      <button onClick={handleCreate} style={buttonStyles}>
        Create
      </button>
    </div>
  );
}

export default SetProfile;