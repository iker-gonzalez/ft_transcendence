import React, { useState } from 'react';

import MainPasswordInput from '../UI/MainPasswordInput';
import MainButton from '../UI/MainButton';
import Group from '../../interfaces/chat-group.interface';

type ChatSidebarJoinProtectedModalProps = {
  selectedProtectedGroup: Group | null;
  handleJoinRoom: (
    newGroup: Group,
    password: string,
  ) => Promise<0 | 1 | undefined>;
  setPasswordPopupVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const ChatSidebarJoinProtectedModal: React.FC<
  ChatSidebarJoinProtectedModalProps
> = ({
  selectedProtectedGroup,
  handleJoinRoom,
  setPasswordPopupVisible,
}): JSX.Element => {
  
  const [password, setPassword] = useState('');

  const onJoiningProtectedChannel = () => {
    console.log('is form submitting?');
    console.log('selectedGroup: ', selectedProtectedGroup); // esta llegando vacio
    if (selectedProtectedGroup) {
      console.log('entra aqui');
      handleJoinRoom(selectedProtectedGroup, password);
    }
    setPassword('');
    setPasswordPopupVisible(false);
  };

  return (
    <>
      <h1 className="title-1 mb-16">Enter Password</h1>
      <p className="mb-24">
        This is a protected channel. Enter the channel password to become a
        member.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onJoiningProtectedChannel();
        }}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <MainPasswordInput
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
          placeholder="Enter password"
        />
        <MainButton type="submit">Join</MainButton>
      </form>
    </>
  );
};

export default ChatSidebarJoinProtectedModal;
