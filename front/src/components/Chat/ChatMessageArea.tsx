import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Group from '../../interfaces/chat-group.interface';
import User from '../../interfaces/chat-user.interface';
import Message from '../../interfaces/chat-message.interface';
import MessageInput from './ChatMessageInput';
import useChatMessageSocket, {UseChatMessageSocket, } from './useChatMessageSocket';
import { useUserData } from '../../context/UserDataContext';
import { getIntraId } from '../../utils/utils';
import { get } from 'http';

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
        id: "pepe",
        senderName: userData?.username || 'Anonymous',
        senderAvatar: userData?.avatar || 'Anonymous',
        content: newMessage,
        timestamp: new Date().toString(),
      };
      console.log(message);
      console.log('user Data:', userData?.intraId);
      // Update the message list by adding the new message
      setNewMessageList((prevMessages) => [...prevMessages, message]);
      // Send the message to the server using the socket
      console.log('receiverId:', selectedUser?.id);
      console.log('senderId:', userData?.intraId);
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

      <MessageInput
        message={message}
        onInputChange={handleInputChange}
        onMessageSubmit={handleSendMessage}
      />
    </MessageAreaContainer>
  );
};

export default ChatMessageArea;
