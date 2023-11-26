import React, { useState, ChangeEvent, FormEvent } from 'react';
import styled from 'styled-components';
import MainButton from '../UI/MainButton';
import Message from '../../interfaces/chat-message.interface';
import { useUserData } from '../../context/UserDataContext';

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
  onMessageSubmit: (message: Message) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onMessageSubmit }) => {
  const [message, setMessage] = useState('');

  const { userData } = useUserData();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() !== '') {
      const newMessage: Message = {
        id:
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15),
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
