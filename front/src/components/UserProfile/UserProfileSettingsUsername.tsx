import React, { FormEvent, useState } from 'react';
import styled from 'styled-components';
import MainButton from '../UI/MainButton';
import SecondaryButton from '../UI/SecondaryButton';
import MainInput from '../UI/MainInput';
import Cookies from 'js-cookie';
import { capitalizeFirstLetter, getBaseUrl } from '../../utils/utils';
import { useUserData } from '../../context/UserDataContext';
import FlashMessage from '../UI/FlashMessage';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';

const WrapperDiv = styled.div`
  .username-change-container {
    overflow: visible;
    min-width: 200px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    .username-change-form {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }

    .hint {
      margin-top: 5px;
      text-align: right;
    }
  }
`;

const UserProfileSettingsUsername: React.FC<{ className: string }> = ({
  className,
}) => {
  const { setUserData: setContextUserData } = useUserData();
  const [showUsernameForm, setShowUsernameForm] = useState<boolean>(false);
  const [usernameError, setUsernameError] = useState<string>('');
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

      const newUsername: string = formData.get('username') as string;
      const trimmedNewUsername: string = newUsername.trim();

      const res = await fetch(`${getBaseUrl()}/users/username`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: trimmedNewUsername,
        }),
      });

      const data = await res.json();

      if (data.statusCode === 400) {
        setUsernameError(data.message[0]);
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

  const handleCloseEdit = (): void => {
    setShowUsernameForm(false);
    setUsernameError('');
    setUsernameSuccessMessage('');
  };

  return (
    <WrapperDiv className={className}>
      <h3 className="title-3">Username</h3>
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
              placeholder="New username*"
              id="username"
              name="username"
              maxLength={12}
            />
            <MainButton type="submit" aria-label="Confirm edit">
              ✓
            </MainButton>
            <SecondaryButton type="button" onClick={handleCloseEdit}>
              ✗
            </SecondaryButton>
          </form>
          <p className="small hint">
            <span>*Username must be between 5 and 12 characters</span>
            <br />
            <span>
              Only letters, numbers, hyphen, and underscore are allowed
            </span>
          </p>
          {usernameError && (
            <FlashMessage
              text={capitalizeFirstLetter(usernameError)}
              level={FlashMessageLevel.ERROR}
            />
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
            <FlashMessage
              text={usernameSuccessMessage}
              level={FlashMessageLevel.SUCCESS}
            />
          )}
        </div>
      )}
    </WrapperDiv>
  );
};

export default UserProfileSettingsUsername;
