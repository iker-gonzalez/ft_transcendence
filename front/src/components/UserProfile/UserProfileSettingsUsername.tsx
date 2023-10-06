import React, { FormEvent, useState } from 'react';
import styled from 'styled-components';
import MainButton from '../UI/MainButton';
import SecondaryButton from '../UI/SecondaryButton';
import MainInput from '../UI/MainInput';
import Cookies from 'js-cookie';
import { capitalizeFirstLetter, getBaseUrl } from '../../utils/utils';
import { useUserData } from '../../context/UserDataContext';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import { useFlashMessages } from '../../context/FlashMessagesContext';

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
}): JSX.Element => {
  const { setUserData: setContextUserData } = useUserData();
  const [showUsernameForm, setShowUsernameForm] = useState<boolean>(false);
  const { launchFlashMessage } = useFlashMessages();

  const handleEditUsernameSubmit = async (
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

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
        launchFlashMessage(
          capitalizeFirstLetter(data.message[0]),
          FlashMessageLevel.ERROR,
        );
        return;
      }

      if (data.updated) {
        launchFlashMessage('Username updated!', FlashMessageLevel.SUCCESS);

        setContextUserData((prev: any) => {
          return { ...prev, username: data.data.username };
        });

        setShowUsernameForm(false);
      }
    } catch (err: any) {
      launchFlashMessage(
        'An error occurred. Try again later.',
        FlashMessageLevel.ERROR,
      );
    }
  };

  const handleCloseEdit = (): void => {
    setShowUsernameForm(false);
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
        </div>
      )}
    </WrapperDiv>
  );
};

export default UserProfileSettingsUsername;
