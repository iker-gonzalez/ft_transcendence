import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Group from '../../interfaces/chat-group.interface';
import User from '../../interfaces/chat-user.interface';
import Message from '../../interfaces/chat-dm-message.interface';
import MessageInput from './ChatMessageInput';
import useChatMessageSocket, {
  UseChatMessageSocket,
} from './useChatMessageSocket';
import { useUserData } from '../../context/UserDataContext';
import { getIntraId } from '../../utils/utils';
import ContrastPanel from '../UI/ContrastPanel';
import GradientBorder from '../UI/GradientBorder'; //Use GradientBorder in MessageArea component
import {
  darkerBgColor,
  darkestBgColor,
  primaryLightColor,
} from '../../constants/color-tokens';

const MessageAreaContainer = styled(ContrastPanel)`
  width: 100%;
  padding: 20px;
  position: relative; 
`;

const Title = styled.h2`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const MessageList = styled.ul`
  list-style: none;
  padding: 0;
`;

const MessageItem = styled.li`
  margin: 10px 0;
`;

const CenteredContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;

  .chat-mode-gradient {
    background: #00aeb5;
    background: linear-gradient(180deg, #ffd369 0%, #00aeb5 100%);
    border-radius: 25px;
  }
`;

const StyledParagraph = styled.p`
  font-size: 28px;
  font-weight: bold;
  color: white;
  text-align: center;
`;

const MessageInputWrapper = styled.div`
  position: absolute;
  bottom: 20px;
  width: 100%;
`;


interface ChatMessageAreaProps {
  selectedUser: User | null;
  selectedGroup: Group | null;
  messages: Message[];
}

const ChatMessageArea: React.FC<ChatMessageAreaProps> = ({
  selectedUser,
  selectedGroup,
  messages,
}) => {
  const title = selectedUser?.username || selectedGroup?.name;

  // Declare and initialize the message state
  const [message, setMessage] = useState('');

  // Get the socket and related objects from the utility function
  const {
    chatMessageSocketRef,
    isSocketConnected,
    isConnectionError,
  }: UseChatMessageSocket = useChatMessageSocket();

  // Add a listener for incoming messages
  useEffect(() => {
    if (isSocketConnected) {
      chatMessageSocketRef.current.on('newMessage', (messageData: Message) => {
        // Handle the incoming message, e.g., add it to your message list
        console.log('Received a new message:', messageData);

        // You can update your message state or perform other actions here
      });
    }
  }, [isSocketConnected, chatMessageSocketRef]);

  // Store the message list in a state variable
  const [newMessageList, setNewMessageList] = useState<Message[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const { userData } = useUserData();

  const handleSendMessage = (newMessage: string) => {
    if (newMessage.trim() !== '') {
      // Implement logic to add the message to the chat or send it to the server
      const message: Message = {
        id: 'pepe', //substitute with real random id
        senderName: userData?.username || 'Anonymous',
        senderAvatar: userData?.avatar || 'Anonymous',
        content: newMessage,
        timestamp: new Date().toString(),
      };
      console.log(message);
      // Update the message list by adding the new message
      setNewMessageList((prevMessages) => [...prevMessages, message]);
      // Send the message to the server using the socket
      const receiverId = getIntraId(selectedUser?.username || 'Anonymous'); // temporary until endpoint is fixed
      chatMessageSocketRef.current.emit('privateMessage', {
        receiverId: receiverId, // temporary until endpoint is fixed
        senderId: userData?.intraId,
        content: newMessage,
      });
      // Clear the input field
      setMessage('');
    }
  };

  return (
    <MessageAreaContainer>
      {selectedUser || selectedGroup ? (
        <>
          {title && <Title>{title}</Title>}
          <MessageList>
            {messages.map((message) => (
              <MessageItem key={message.id}>
                {`${message.senderName}: ${message.content}`}
              </MessageItem>
            ))}
            {/* Render the new message below the last message */}
            {newMessageList.map((messageData, index) => (
              <MessageItem key={index}>
                {`${messageData.senderName}: ${messageData.content}`}
              </MessageItem>
            ))}
          </MessageList>
          <MessageInputWrapper>
          <MessageInput
            message={message}
            onInputChange={handleInputChange}
            onMessageSubmit={handleSendMessage}
          />
          </MessageInputWrapper>
        </>
      ) : (
        <CenteredContainer>
          <StyledParagraph>
            Chat with your friends or participate in our community groups!
          </StyledParagraph>
        </CenteredContainer>
      )}
    </MessageAreaContainer>
  );
};

export default ChatMessageArea;
