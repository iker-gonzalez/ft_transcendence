import React from 'react';
import Modal from '../UI/Modal';
import MainButton from '../UI/MainButton';

const UserProfileWelcomeModal: React.FC<{
  setShowNewUserModal: (arg0: boolean) => void;
  username: string | undefined;
}> = ({ setShowNewUserModal, username }): JSX.Element => {
  return (
    <Modal
      dismissModalAction={() => {
        setShowNewUserModal(false);
      }}
    >
      <h2 className="title-1 mb-24">Hello, {username ?? 'stranger'}!</h2>
      <p className="mb-16">We're happy to see you here 😍</p>
      <p className="mb-24">
        This is your profile page. We grabbed your profile picture and username
        from the 42 Intra API, but feel free to change them if you prefer.
      </p>
      <MainButton
        onClick={() => {
          setShowNewUserModal(false);
        }}
      >
        Continue
      </MainButton>
    </Modal>
  );
};

export default UserProfileWelcomeModal;
