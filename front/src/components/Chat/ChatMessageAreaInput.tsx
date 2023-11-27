import React, { useState, ChangeEvent, FormEvent } from 'react';
import styled from 'styled-components';
import MainButton from '../UI/MainButton';
import DirectMessage from '../../interfaces/chat-message.interface';
import { useUserData } from '../../context/UserDataContext';
import Group from '../../interfaces/chat-group.interface';
import User from '../../interfaces/chat-user.interface';

const InputContainer = styled.div`
  margin-top: 20px;
`;

const InputField = styled.input`
  width: 80%;
  padding: 10px;
  margin-right: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
`;

interface MessageInputProps {
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onMessageSubmit: (message: DirectMessage) => void;
  selectedUser: User | null;
  selectedGroup: Group | null;
}

const MessageInput: React.FC<MessageInputProps> = ({ onMessageSubmit, selectedUser, selectedGroup }) => {
  const [message, setMessage] = useState('');

  const { userData } = useUserData();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() !== '') {
      const newMessage: DirectMessage = {
        id:
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15),
        senderIntraId: userData?.intraId || 0,
        receiverIntraId: selectedUser?.intraId || 0,
        senderName: userData?.username || 'Anonymous',
        senderAvatar: userData?.avatar || 'Anonymous',
        content: message,
        timestamp: new Date().toString(),
      };
      onMessageSubmit(newMessage);
      setMessage('');
    }
  };

  return (
    <InputContainer>
      <form onSubmit={handleSubmit}>
        <InputField
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={handleChange}
        />
        <MainButton type="submit">Send</MainButton>
      </form>
    </InputContainer>
  );
};

export default MessageInput;
