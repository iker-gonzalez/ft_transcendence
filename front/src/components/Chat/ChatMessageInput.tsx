import React, { useState, ChangeEvent, FormEvent } from 'react';
import styled from 'styled-components';

const InputContainer = styled.div`
  margin-top: 20px;
`;

const InputField = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
`;

const SendButton = styled.button`
  margin-top: 10px;
  padding: 10px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

interface MessageInputProps {
  message: string; // Add the 'message' prop here
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onMessageSubmit: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onMessageSubmit }) => {
  const [message, setMessage] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() !== '') {
      onMessageSubmit();
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
        <SendButton type="submit">Send</SendButton>
      </form>
    </InputContainer>
  );
};

export default MessageInput;
