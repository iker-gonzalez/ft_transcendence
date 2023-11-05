import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Group from '../../interfaces/chat-group.interface';
import User from '../../interfaces/chat-user.interface';
import MessageInput from './ChatMessageInput';
import useChatMessageSocket, {UseChatMessageSocket, } from './useChatMessageSocket';

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

const ChatMessageArea: React.FC<ChatMessageAreaProps> = ({
  selectedUser,
  selectedGroup,
  messages,
}) => {
  const selectedMessages = selectedUser
    ? messages[selectedUser.id]
    : selectedGroup
    ? messages[selectedGroup.id]
    : [];

  const title = selectedUser?.name || selectedGroup?.name;

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
    const [messageList, setMessageList] = useState<Message[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = (newMessage: string) => {
    if (newMessage.trim() !== '') {
      // Implement logic to add the message to the chat or send it to the server
      const messageData: Message = {
        sender: selectedUser ? selectedUser.name : selectedGroup ? selectedGroup.name : '',
        text: newMessage,
      };
      console.log(messageData);
      // Update the message list by adding the new message
      setMessageList((prevMessages) => [...prevMessages, messageData]);
      // Send the message to the server using the socket
      chatMessageSocketRef.current.emit('privateMessage', {
        receiverId: "9f880f95-df01-47ef-bfcb-7ceba199dcd5", // Replace with dynamically captured receiver's user ID
        senderId: "c50ccdbe-5461-4496-b9ae-7a308d87e7b6", // Replace with dynamically captured sender's user ID
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
        {selectedMessages.map((message, index) => (
          <MessageItem key={index}>
            {`${message.sender}: ${message.text}`}
          </MessageItem>
        ))}
        {/* Render the new message below the last message */}
        {messageList.map((messageData, index) => (
          <MessageItem key={index}>
            {`${messageData.sender}: ${messageData.text}`}
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
