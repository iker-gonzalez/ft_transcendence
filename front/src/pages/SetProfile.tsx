import React, { useState } from 'react';
import styled from 'styled-components';

// Styled components
const FormContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Heading = styled.h2`
  font-family: Arial;
  font-size: 30px;
  margin-bottom: 20px;
`;

const InputField = styled.div`
  width: 150px;
  margin-bottom: 20px;

  input {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border: none;
    border-radius: 5px;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
  }
`;

const AvatarInput = styled.input`
  display: none;
`;

const AvatarLabel = styled.label`
  width: 150px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 20px;
  display: block;

  img {
    max-width: 200px;
    max-height: 200px;
    margin-top: 10px;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  margin-top: 20px;
  cursor: pointer;

  input {
    margin-right: 10px;
  }
`;

const CreateButton = styled.button`
  width: 175px;
  height: 50px;
  background-color: gold;
  color: black;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
  margin-top: 30px;
`;

function SetProfile() {
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);

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
    <FormContainer>
      <Heading>Choose your username</Heading>
      <InputField>
        <label htmlFor="username"></label>
        <input
          type="text"
          placeholder="username"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </InputField>
      <Heading>Choose your avatar</Heading>
      <AvatarLabel>
        <AvatarInput
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
        />
        {avatar && (
          <img
            src={URL.createObjectURL(avatar)}
            alt="Selected Avatar"
          />
        )}
        {avatar ? 'Change Avatar' : 'Upload Avatar'}
      </AvatarLabel>
      <CheckboxLabel>
        <input
          type="checkbox"
          checked={isTwoFactorEnabled}
          onChange={handleTwoFactorChange}
        />
        Enable Two-Factor Authentication
      </CheckboxLabel>
      <CreateButton onClick={handleCreate}>Create</CreateButton>
    </FormContainer>
  );
}

export default SetProfile;
