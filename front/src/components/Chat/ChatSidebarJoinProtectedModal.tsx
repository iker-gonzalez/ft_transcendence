import React, { useState } from 'react';

import MainPasswordInput from '../UI/MainPasswordInput';
import MainButton from '../UI/MainButton';
import Group from '../../interfaces/chat-group.interface';

type ChatSidebarJoinProtectedModalProps = {
  handleJoinRoom: (
    newGroup: Group,
    password: string,
    isNewGroup: boolean,
  ) => Promise<0 | 1 | undefined>;
  setPasswordPopupVisible: React.Dispatch<React.SetStateAction<boolean>>;
  selectedProtectedGroupToJoin: Group | null;
  updateUserSidebar: () => void;
};

const ChatSidebarJoinProtectedModal: React.FC<
  ChatSidebarJoinProtectedModalProps
> = ({
  handleJoinRoom,
  setPasswordPopupVisible,
  selectedProtectedGroupToJoin,
  updateUserSidebar,
}): JSX.Element => {
  const [password, setPassword] = useState('');

  const onJoiningProtectedChannel = async () => {
    if (selectedProtectedGroupToJoin) {
      const isErrorJoining = Boolean(
        await handleJoinRoom(selectedProtectedGroupToJoin, password, false),
      );
      setPassword('');

      if (!isErrorJoining) setPasswordPopupVisible(false);
    }
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
          setTimeout(updateUserSidebar, 250);
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
        <MainButton type="submit" disabled={password.length === 0}>
          Join
        </MainButton>
      </form>
    </>
  );
};

export default ChatSidebarJoinProtectedModal;
