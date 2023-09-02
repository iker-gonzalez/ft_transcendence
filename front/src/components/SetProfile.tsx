import React, { useState } from 'react';

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
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
      <button onClick={handleCreate} style={{ marginTop: '20px' }}>
        Create
      </button>
    </div>
  );
}

export default SetProfile;
