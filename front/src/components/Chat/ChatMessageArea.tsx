import React, { useState, RefObject } from 'react';
import styled from 'styled-components';
import Group from '../../interfaces/chat-group.interface';
import User from '../../interfaces/chat-user.interface';
import Message from '../../interfaces/chat-message.interface';
import MessageInput from './ChatMessageAreaInput';
import ChatMessageAreaHeader from './ChatMessageAreaHeader';
import { Socket } from 'socket.io-client';
import { useUserData } from '../../context/UserDataContext';
import GradientBorder from '../UI/GradientBorder';
import { darkerBgColor } from '../../constants/color-tokens';
import DirectMessage from '../../interfaces/chat-message.interface';

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
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
  selectedGroup: Group | null;
  setSelectedGroup: React.Dispatch<React.SetStateAction<Group | null>>;
  updateUserGroups: (group: Group) => void;
  messages: Message[];
  setMessagesByChat: React.Dispatch<
    React.SetStateAction<{ [key: string]: Message[] }>
  >;
  messagesByChat: { [key: string]: Message[] };
  onNewMessage: (newMessage: DirectMessage) => void;
  socket: Socket | null;
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
  setSelectedUser,
  selectedGroup,
  setSelectedGroup,
  updateUserGroups,
  messages,
  setMessagesByChat,
  messagesByChat,
  onNewMessage,
  socket,
}) => {
  // Declare and initialize the message state
  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const { userData } = useUserData();

  const handlePrivateMessage = (newMessage: Message) => {
    if (selectedUser) {
      // setMessagesByChat((prevMessages: { [key: string]: Message[] }) => ({
      //   ...prevMessages,
      //   [selectedUser.username]: [
      //     ...(prevMessages[selectedUser.username] || []),
      //     newMessage,
      //   ],
      // }));
      if (socket) {
        console.log('message content: ', newMessage);
        socket.emit('privateMessage', newMessage);
      }
      setMessage('');
      onNewMessage(newMessage);
    }
  };

  const handleSendRoomMessage = (newMessage: DirectMessage) => {
    if (selectedGroup) {
      // setMessagesByChat((prevMessages: { [key: string]: Message[] }) => ({
      //   ...prevMessages,
      //   [selectedGroup.name]: [
      //     ...(prevMessages[selectedGroup.name] || []),
      //     newMessage,
      //   ],
      // }));
      if (socket) {
        socket.emit('sendMessageToRoom', {
          roomName: selectedGroup?.name,
          intraId: userData?.intraId,
          senderName: userData?.username || 'Anonymous',
          senderAvatar: userData?.avatar || 'Anonymous',
          message: newMessage,
        });
      }
      setMessage('');
      onNewMessage(newMessage);
    }
  };

  const navigateToEmptyChat = () => {
    setSelectedUser(null);
    setSelectedGroup(null);
  };

  return (
    <MessageAreaContainer>
      <GradientBorder className="gradient-border">
        {selectedUser || selectedGroup ? (
          <>
            <WrapperDiv>
              <ChatMessageAreaHeader
                user={selectedUser}
                group={selectedGroup}
                socket={socket}
                navigateToEmptyChat={navigateToEmptyChat}
              />
              <MessageList>
                {messages && messages.length > 0 && messages.map((message) => (
                  <MessageItem key={message.id}>
                    {`${message.senderName}: ${message.content}`}
                  </MessageItem>
                ))}
                {(
                  (selectedUser && messagesByChat[selectedUser.username]) ||
                  (selectedGroup && messagesByChat[selectedGroup.name]) ||
                  []
                ).map((messageData) => (
                  <MessageItem key={messageData.id}>
                    {`${messageData.senderName}: ${messageData.content}`}
                  </MessageItem>
                ))}
              </MessageList>
            </WrapperDiv>
            <WrapperDiv2>
              <MessageInput
                onInputChange={handleInputChange}
                selectedUser={selectedUser}
                selectedGroup={selectedGroup}
                onMessageSubmit={
                  selectedGroup ? handleSendRoomMessage : handlePrivateMessage
                }
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
