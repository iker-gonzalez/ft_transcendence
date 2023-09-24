import React, { FormEvent, useState } from 'react';
import styled from 'styled-components';
import MainButton from './UI/MainButton';
import MainInput from './UI/MainInput';
import { errorColor, successColor } from '../constants/color-tokens';
import Cookies from 'js-cookie';
import { capitalizeFirstLetter, getBaseUrl } from '../utils/utils';
import { useUserData } from '../context/UserDataContext';

const WrapperDiv = styled.div`
  .username-change-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    .error-message {
      color: ${errorColor};
      margin-top: 5px;
      font-weight: bold;
    }

    .username-change-form {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }
  }

  .success-message {
    color: ${successColor};
    margin-top: 5px;
    font-weight: bold;
  }
`;

const UserProfileSettingsUsername: React.FC<{ className: string }> = ({
  className,
}) => {
  const { setUserData: setContextUserData } = useUserData();
  const [showUsernameForm, setShowUsernameForm] = useState<boolean>(false);
  const [usernameError, setUsernameError] = useState<string>();
  const [usernameSuccessMessage, setUsernameSuccessMessage] =
    useState<string>('');

  const handleEditUsernameSubmit = async (
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setUsernameError('');
    setUsernameSuccessMessage('');

    try {
      const formData = new FormData(e.target as HTMLFormElement);

      const res = await fetch(`${getBaseUrl()}/users/username`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: formData.get('username') as string,
        }),
      });

      const data = await res.json();

      if (data.statusCode === 400) {
        setUsernameError(data.message);
        return;
      }

      if (data.updated) {
        setUsernameSuccessMessage('Username updated!');
        setContextUserData((prev: any) => {
          return { ...prev, username: data.data.username };
        });

        setShowUsernameForm(false);
      }
    } catch (err: any) {
      setUsernameError('An error occurred. Try again later.');
    }
  };

  return (
    <WrapperDiv className={className}>
      <p className="title-3">Username</p>
      {showUsernameForm ? (
        <div className="username-change-container">
          <form
            onSubmit={handleEditUsernameSubmit}
            className="username-change-form"
          >
            <label htmlFor="username" className="sr-only">
              Choose new username
            </label>
            <MainInput
              type="text"
              placeholder="New username"
              id="username"
              name="username"
              maxLength={12}
            />
            <MainButton type="submit" aria-label="Confirm edit">
              ✓
            </MainButton>
          </form>
          {usernameError && (
            <p className="small error-message">
              {capitalizeFirstLetter(usernameError[0])}
            </p>
          )}
        </div>
      ) : (
        <div className="username-change-container">
          <MainButton
            onClick={() => {
              setShowUsernameForm((prev) => !prev);
            }}
          >
            Change
          </MainButton>
          {usernameSuccessMessage && (
            <p className="small success-message">{usernameSuccessMessage}</p>
          )}
        </div>
      )}
    </WrapperDiv>
  );
};

export default UserProfileSettingsUsername;
