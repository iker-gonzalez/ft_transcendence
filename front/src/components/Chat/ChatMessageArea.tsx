import React from 'react';
import styled from 'styled-components';
import Group from '../../interfaces/chat-group.interface';
import User from '../../interfaces/chat-user.interface';

const MessageAreaContainer = styled.div`
  width: calc(75% - 10px); /* Subtract 10px for margin/padding */
  background-color: black;
  color: white;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  border: 2px solid yellow;
  position: absolute;
  top: 100px; /* Adjust the offset as needed */
  right: 0; /* Position on the right */
  bottom: 0; /* Occupy the full height */
  overflow-y: auto; /* Add scroll behavior when content overflows */
`;

const Conversation = styled.div`
  margin: 10px 0;
`;

const Title = styled.h2`
  font-size: 16px;
  font-weight: bold;
`;

const MessageList = styled.ul`
  list-style: none;
  padding: 0;
`;

const MessageItem = styled.li`
  margin: 5px 0;
`;


// Define an interface for dummyMessages
interface Message {
    sender: string;
    text: string;
  }
  
interface MessageData {
    [key: number]: Message[];
  }


  interface ChatMessageAreaProps {
    selectedUser: User | null;
    selectedGroup: Group | null;
    messages: MessageData;
  } 

const ChatMessageArea: React.FC<ChatMessageAreaProps> = ({ selectedUser, selectedGroup, messages}) => {
  const selectedMessages = selectedUser 
    ? messages[selectedUser.id] 
    : selectedGroup
      ? messages[selectedGroup.id]
      : [];

  const title = selectedUser?.name || selectedGroup?.name;

  return (
    <MessageAreaContainer>
      {title && <Title>{title}</Title>}

      <MessageList>
        {selectedMessages.map((message, index) => (
          <div key={index} className="message">
            {message.text}
          </div>
        ))}
      </MessageList>

      {/* Input and send message */}

    </MessageAreaContainer>
  );
};

export default ChatMessageArea;
