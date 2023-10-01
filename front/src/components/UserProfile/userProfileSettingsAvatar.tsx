import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import MainButton from '../UI/MainButton';
import SecondaryButton from '../UI/SecondaryButton';
import Modal from '../UI/Modal';
import { blackColor, primaryAccentColor } from '../../constants/color-tokens';
import { useModalContext } from '../../context/ModalContext';
import { capitalizeFirstLetter, getBaseUrl } from '../../utils/utils';
import Cookies from 'js-cookie';
import { useUserData } from '../../context/UserDataContext';
import UserData from '../../interfaces/user-data.interface';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import FlashMessage from '../UI/FlashMessage';

const WrapperDiv = styled.div`
  .edit-avatar-btn {
    width: 50px;
    height: 50px;
    border-radius: 50%;

    font-size: 2.1rem;
    font-weight: bold;

    display: flex;
    justify-content: center;
    align-items: center;

    transform: scaleX(-1);
  }
`;

const AvatarFormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .avatar-preview {
    width: 200px;
    height: 200px;
    object-fit: cover;
    margin-bottom: 24px;
    outline: 1px ${primaryAccentColor} solid;
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;

    min-width: 300px;

    .avatar-label {
      width: 100%;
      padding: 10px 25px;
      background-color: ${primaryAccentColor};
      color: ${blackColor};
      border-radius: 5px;
      border: none;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .submit-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .actions-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }
    }
  }
`;

const UserProfileSettingsAvatar: React.FC<{
  className: string;
  userData: UserData;
}> = ({ className, userData }) => {
  const { setUserData } = useUserData();
  const { setShowModal } = useModalContext();
  const [isFileUploaded, setIsFileUploaded] = useState<boolean>(false);
  const [avatarSrc, setAvatarSrc] = useState<string>(userData.avatar);
  const uploadedFileContent = useRef<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const cleanupAvatarState = (): void => {
    setShowErrorMessage(false);
    setErrorMessage('');
    setSuccessMessage('');
    setIsFileUploaded(false);
    setAvatarSrc(userData.avatar);
  };

  const onUploadAvatar = (e: React.ChangeEvent<HTMLFormElement>): void => {
    uploadedFileContent.current = e.target.files[0];

    // If aborting the file upload, do nothing
    if (!e.target.files[0]) return;

    const fileUrl = URL.createObjectURL(e.target.files[0]);
    setAvatarSrc(fileUrl);
    setIsFileUploaded(true);
  };

  const onSubmitAvatar = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    cleanupAvatarState();

    try {
      const formData: FormData = new FormData();
      formData.append('avatar', uploadedFileContent.current);

      const res: Response = await fetch(`${getBaseUrl()}/users/avatar`, {
        method: 'PATCH',
        body: formData,
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });

      const data = await res.json();

      if (data.updated === 1) {
        const newAvatarSrc: string = data.data.avatar;

        setUserData((prevState: any) => {
          const newUserData: UserData = {
            ...prevState,
            avatar: newAvatarSrc,
          };
          return newUserData;
        });
        setShowModal(false);
        cleanupAvatarState();
        setAvatarSrc(newAvatarSrc);
        setSuccessMessage('Avatar successfully updated!');
        setShowErrorMessage(true);
      } else {
        const errorMessage: string | null = data.message;
        if (errorMessage?.length) {
          cleanupAvatarState();
          setErrorMessage(errorMessage);
          setShowErrorMessage(true);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('An error occurred. Try again later.');
      setShowErrorMessage(true);
      setShowModal(false);
    }
  };

  return (
    <>
      <WrapperDiv className={className}>
        <MainButton
          onClick={() => {
            setShowModal((prev) => !prev);
          }}
          aria-label="Change avatar"
          className="edit-avatar-btn"
        >
          ✎
        </MainButton>
        <Modal dismissModalCleanup={cleanupAvatarState}>
          <h1 className="title-2 mb-24">Choose a new avatar</h1>
          <p>Your profile picture will be public.</p>
          <p className="mb-16">Upload your best selfie 🤩</p>
          <AvatarFormWrapper>
            <img src={avatarSrc} alt="" className="avatar-preview" />
            <form
              encType="multipart/form-data"
              onChange={onUploadAvatar}
              onSubmit={onSubmitAvatar}
            >
              <label
                htmlFor="avatar"
                className={`avatar-label ${isFileUploaded && 'sr-only'}`}
              >
                Upload new avatar
                <input
                  id="avatar"
                  name="avatar"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                />
              </label>
              {isFileUploaded && (
                <div className="submit-container">
                  <div className="actions-container">
                    <SecondaryButton type="button" onClick={cleanupAvatarState}>
                      Cancel
                    </SecondaryButton>
                    <MainButton type="submit">Confirm</MainButton>
                  </div>
                </div>
              )}
            </form>
          </AvatarFormWrapper>
        </Modal>
      </WrapperDiv>
      {showErrorMessage && (
        <FlashMessage
          text={capitalizeFirstLetter(errorMessage)}
          level={FlashMessageLevel.ERROR}
        />
      )}
      {!!successMessage.length && (
        <FlashMessage
          text={capitalizeFirstLetter(successMessage)}
          level={FlashMessageLevel.SUCCESS}
        />
      )}
    </>
  );
};

export default UserProfileSettingsAvatar;
