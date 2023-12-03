import React, { useState, ChangeEvent, FormEvent } from 'react';
import styled from 'styled-components';
import MainButton from '../UI/MainButton';
import DirectMessage from '../../interfaces/chat-message.interface';
import GroupMessage from '../../interfaces/chat-group-message.interface';
import { useUserData } from '../../context/UserDataContext';
import Group from '../../interfaces/chat-group.interface';
import User from '../../interfaces/chat-user.interface';
import MainInput from '../UI/MainInput';
import { createNewDirectMessage } from '../../utils/utils';
import { UserInfo } from '../../interfaces/chat-channel-data.interface';

const InputContainer = styled.div`
  margin-top: 20px;

  form {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;

    > input {
      flex: 1;
    }
  }
`;

interface MessageInputProps {
  onMessageSubmit: (message: DirectMessage | GroupMessage) => void;
  selectedUser: User | null;
  selectedGroup: Group | null;
  mutedUsers: UserInfo[];
}

const MessageInput: React.FC<MessageInputProps> = ({
  onMessageSubmit,
  selectedUser,
  selectedGroup,
  mutedUsers
}) => {

  const [message, setMessage] = useState('');

  const { userData } = useUserData();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const mutedUsersIntraIds = mutedUsers.map((user) => user.intra);

  const isMuted = mutedUsersIntraIds.includes(userData?.intraId || 0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() !== '') {
      if (selectedUser && userData) {
        const newDirectMessage: DirectMessage = createNewDirectMessage({
          selectedUser,
          userData,
          contentText: message,
        });
        onMessageSubmit(newDirectMessage);
        setMessage('');
      } else if (selectedGroup) {
        console.log('new group message: ', message);
        const newGroupMessage: GroupMessage = {
          id:
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15),
          roomName: selectedGroup?.name || 'Anonymous',
          senderIntraId: userData?.intraId || 0,
          senderName: userData?.username || 'Anonymous',
          senderAvatar: userData?.avatar || 'Anonymous',
          content: message,
          timestamp: new Date().toString(),
        };
        onMessageSubmit(newGroupMessage);
        setMessage('');
      }
    }
  };

  return (
    <InputContainer>
      <form onSubmit={handleSubmit}>
        <MainInput
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={handleChange}
        />
        <MainButton type="submit" disabled={isMuted} title={isMuted ? "You are currently muted on this chat" : ""}>Send</MainButton>
      </form>
    </InputContainer>
  );
};

export default MessageInput;
