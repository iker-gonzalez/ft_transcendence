import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Group from '../../interfaces/chat-group.interface';
import User from '../../interfaces/chat-user.interface';
import Message from '../../interfaces/chat-dm-message.interface';
import MessageInput from './ChatMessageAreaInput';
import ChatMessageAreaHeader from './ChatMessageAreaHeader';
import useChatMessageSocket, {
  UseChatMessageSocket,
} from './useChatMessageSocket';
import { useUserData } from '../../context/UserDataContext';
import { getIntraIdFromUsername, getUsernameFromIntraId } from '../../utils/utils';
import GradientBorder from '../UI/GradientBorder';
import { darkerBgColor } from '../../constants/color-tokens';

const MessageAreaContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;

  .gradient-border {
    height: 80vh;
    background-color: ${darkerBgColor};
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow-y: auto; /* Add scroll behavior when content overflows */
  }
`;

const WrapperDiv = styled.div`
justify-content: flex-start;
`;

const WrapperDiv2 = styled.div`
justify-content: flex-start;
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
  setMessagesByChat: React.Dispatch<React.SetStateAction<{ [key: string]: Message[] }>>;
  messagesByChat: { [key: string]: Message[] };
}

/**
 * ChatMessageArea component that displays the messages of the selected chat.
 * @param selectedUser The selected user to chat with.
 * @param selectedGroup The selected group to chat in.
 * @param messages The messages of the selected chat.
 * @returns React functional component.
 */

const ChatMessageArea: React.FC<ChatMessageAreaProps> = ({
  selectedUser,
  selectedGroup,
  messages,
  setMessagesByChat,
  messagesByChat,
}) => {

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
      if (!selectedUser) {
        console.log('no selected user');
    return;
  }
  if (isSocketConnected) {
    const listener = (messageData: any) => {
      const parsedData = JSON.parse(messageData);
      const newMessage: Message = {
        senderName: getUsernameFromIntraId(parsedData.senderId)?.toString() || 'Anonymous',
        senderAvatar: getUsernameFromIntraId(parsedData.senderAvatar)?.toString() || 'Anonymous',
        content: parsedData.content,
        timestamp: Date.now().toString(),
      };
      //Append the new message to the messages state
        setMessagesByChat((prevMessages: { [key: string]: Message[] }) => ({
          ...prevMessages,
          [selectedUser.username]: [...(prevMessages[selectedUser.username] || []), newMessage]
        }));
    };
      // Add the listener to the socket
      chatMessageSocketRef.current.on(`privateMessageReceived/${userData?.intraId.toString()}`, listener);

    // Clean up the listener when the component unmounts or when the receiverId changes
     return () => {
       chatMessageSocketRef.current.off(`privateMessageReceived/${userData?.intraId.toString()}`, listener);
    };
  }
  }, [selectedUser, isSocketConnected, chatMessageSocketRef]);


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
      const receiverIntraId = getIntraIdFromUsername(selectedUser?.username || 'Anonymous'); // temporary until endpoint is fixed
      chatMessageSocketRef.current.emit('privateMessage', {
        receiverId: receiverIntraId, // temporary until endpoint is fixed
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
      console.log('sending message to room');
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
        <WrapperDiv>
          <ChatMessageAreaHeader user={selectedUser} group={selectedGroup} />          
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
        </WrapperDiv>
        <WrapperDiv2>
          <MessageInput
            message={message}
            onInputChange={handleInputChange}
            onMessageSubmit={selectedGroup ? handleSendRoomMessage : handlePrivateMessage}
          />
        </WrapperDiv2>
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