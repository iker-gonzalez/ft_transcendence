import React, { useState, ChangeEvent, FormEvent } from 'react';
import styled from 'styled-components';
import MainButton from '../UI/MainButton';
import DirectMessage from '../../interfaces/chat-message.interface';
import GroupMessage from '../../interfaces/chat-group-message.interface';
import { useUserData } from '../../context/UserDataContext';
import Group from '../../interfaces/chat-group.interface';
import User from '../../interfaces/chat-user.interface';
import MainInput from '../UI/MainInput';

interface MessageInputProps {
  onMessageSubmit: (message: DirectMessage | GroupMessage) => void;
  selectedUser: User | null;
  selectedGroup: Group | null;
  mutedUsers: { username: string }[];
}

const InputContainer = styled.div`
  margin-top: 20px;

  form {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;

    > input {
      flex: 1;
    }
  }
`;

const MessageInput: React.FC<MessageInputProps> = ({
  onMessageSubmit,
  selectedUser,
  selectedGroup,
  mutedUsers,
}) => {
  const [message, setMessage] = useState('');
  const { userData } = useUserData();

  const isCurrentUserBlocked = mutedUsers?.some(
    (mutedUser) => mutedUser.username === userData?.username,
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() !== '') {
      if ((selectedUser || selectedGroup) && userData) {
        const newMessage = {
          id:
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15),
          roomName: selectedGroup?.name || '',
          receiverIntraId: selectedUser?.intraId || 0,
          receiverName: selectedUser?.username || 'Anonymous',
          senderIntraId: userData?.intraId || 0,
          senderName: userData?.username || 'Anonymous',
          senderAvatar: userData?.avatar || 'Anonymous',
          content: message,
          createdAt: new Date().toISOString(),
        };
        onMessageSubmit(newMessage);
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
          minLength={1}
          maxLength={124}
          value={message}
          onChange={handleChange}
          disabled={selectedUser?.isBlocked || isCurrentUserBlocked}
        />
        <MainButton
          type="submit"
          disabled={selectedUser?.isBlocked || isCurrentUserBlocked}
        >
          Send
        </MainButton>
      </form>
    </InputContainer>
  );
};

export default MessageInput;
