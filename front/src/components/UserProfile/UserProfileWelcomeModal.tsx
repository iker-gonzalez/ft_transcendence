import React from 'react';
import Modal from '../UI/Modal';
import MainButton from '../UI/MainButton';

type WelcomeModalProps = {
  setShowNewUserModal: (arg0: boolean) => void;
  username: string | undefined;
};

const UserProfileWelcomeModal: React.FC<WelcomeModalProps> = ({
  setShowNewUserModal,
  username,
}): JSX.Element => {
  return (
    <Modal
      dismissModalAction={() => {
        setShowNewUserModal(false);
      }}
    >
      <h2 className="title-1 mb-8">Hello, {username ?? 'stranger'}!</h2>
      <p className="mb-24">
        This is your profile page. We grabbed your profile picture and username
        from the 42 Intra, but you can change them if you prefer.
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
