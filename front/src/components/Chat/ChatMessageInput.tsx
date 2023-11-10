import React, { useState, ChangeEvent, FormEvent } from 'react';
import styled from 'styled-components';
import MainButton from '../UI/MainButton';

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
  message: string;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onMessageSubmit: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onMessageSubmit }) => {
  const [message, setMessage] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() !== '') {
      onMessageSubmit(message);
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
