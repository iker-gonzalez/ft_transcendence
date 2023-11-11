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
import GradientBorder from '../UI/GradientBorder';
import { darkerBgColor } from '../../constants/color-tokens';

const MessageAreaContainer = styled.div`
  width: 100%;
  display: flex;

  .gradient-border {
    background-color: ${darkerBgColor};
    padding: 20px;
    flex: 1;
  }
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
`;

const StyledParagraph = styled.p`
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-align: center;
`;

interface ChatMessageAreaProps {
  selectedUser: User | null;
  selectedGroup: Group | null;
  messages: Message[];
}

// Define the MessagesByChat type
type MessagesByChat = {
  [key: string]: Message[];
};

const ChatMessageArea: React.FC<ChatMessageAreaProps> = ({
  selectedUser,
  selectedGroup,
  messages,
}) => {
  const title = selectedUser?.username || selectedGroup?.name;

  // Declare and initialize the message state
  const [message, setMessage] = useState('');
  const [messagesByChat, setMessagesByChat] = useState<MessagesByChat>({});

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const { userData } = useUserData();

  const handlePrivateMessage = (newMessage: string) => {
    console.log('private message');
    if (newMessage.trim() !== '' && selectedUser) {
      const message: Message = {
        senderName: userData?.username || 'Anonymous',
        senderAvatar: userData?.avatar || 'Anonymous',
        content: newMessage,
        timestamp: new Date().toString(),
      };
      setMessagesByChat((prevMessages: { [key: string]: Message[] }) => ({
        ...prevMessages,
        [selectedUser.username]: [...(prevMessages[selectedUser.username] || []), message]
      }));
      const receiverId = getIntraId(selectedUser?.username || 'Anonymous'); // temporary until endpoint is fixed
      chatMessageSocketRef.current.emit('privateMessage', {
        receiverId: receiverId, // temporary until endpoint is fixed
        senderId: userData?.intraId,
        content: newMessage,
      });
      setMessage('');
    }
  };

  const handleSendRoomMessage = (newMessage: string) => {
    if (newMessage.trim() !== '' && selectedGroup) {
      const message: Message = {
        senderName: userData?.username || 'Anonymous',
        senderAvatar: userData?.avatar || 'Anonymous',
        content: newMessage,
        timestamp: new Date().toString(),
      };
      setMessagesByChat((prevMessages: { [key: string]: Message[] }) => ({
        ...prevMessages,
        [selectedGroup.name]: [...(prevMessages[selectedGroup.name] || []), message]
      }));
      chatMessageSocketRef.current.emit('sendMessageToRoom', {
        roomName: selectedGroup?.name,
        intraId: userData?.intraId,
        message: newMessage,
      });
      setMessage('');
    }
  };

  return (
    <MessageAreaContainer>
    <GradientBorder className="gradient-border">
      {selectedUser || selectedGroup ? (
        <>
          {title && <Title>{title}</Title>}
          <MessageList>
            {messages.map((message) => (
                <MessageItem key={message.timestamp}>
                  {`${message.senderName}: ${message.content}`}
                </MessageItem>
            ))}
            {(selectedUser && messagesByChat[selectedUser.username] || selectedGroup && messagesByChat[selectedGroup.name] || []).map((messageData, index) => (
              <MessageItem key={index}>
                {`${messageData.senderName}: ${messageData.content}`}
              </MessageItem>
            ))}
          </MessageList>

          <MessageInput
            message={message}
            onInputChange={handleInputChange}
            onMessageSubmit={selectedGroup ? handleSendRoomMessage : handlePrivateMessage}
          />
        </>
        ) : (
          <CenteredContainer>
            <StyledParagraph>
              Chat with your friends or participate in our community groups!
            </StyledParagraph>
          </CenteredContainer>
        )}
      </GradientBorder>
    </MessageAreaContainer>
  );
};

export default ChatMessageArea;