import React from 'react';
import styled from 'styled-components';
import Group from '../../interfaces/chat-group.interface';
import User from '../../interfaces/chat-user.interface';
import DirectMessage from '../../interfaces/chat-message.interface';
import GroupMessage from '../../interfaces/chat-group-message.interface';
import MessageInput from './ChatMessageAreaInput';
import ChatMessageAreaHeader from './ChatMessageAreaHeader';
import { Socket } from 'socket.io-client';
import { useUserData } from '../../context/UserDataContext';
import GradientBorder from '../UI/GradientBorder';
import {
  darkerBgColor,
  primaryAccentColor,
} from '../../constants/color-tokens';

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

  a {
    color: ${primaryAccentColor};
  }
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
  messages: DirectMessage[];
  onNewMessage: (message: DirectMessage | GroupMessage) => void;
  updateUserSidebar: () => void;
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
  messages,
  onNewMessage,
  updateUserSidebar,
  socket,
}) => {
  const { userData } = useUserData();

  const handleNewMessage = (newMessage: DirectMessage | GroupMessage) => {
    if (socket) {
      if (selectedUser) {
        console.log('message content: ', newMessage);
        socket.emit('privateMessage', newMessage);
      } else if (selectedGroup) {
        console.log('new group message sending to socket: ', newMessage);
        socket.emit('sendMessageToRoom', {
          roomName: selectedGroup?.name,
          intraId: userData?.intraId,
          senderName: userData?.username || 'Anonymous',
          senderAvatar: userData?.avatar || 'Anonymous',
          content: newMessage.content,
        });
      }
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
                updateUserSidebar={updateUserSidebar}
                onNewMessage={handleNewMessage}
                selectedUser={selectedUser}
              />
              <MessageList>
                {messages &&
                  messages.length > 0 &&
                  messages.map((message) => (
                    <MessageItem key={message.id}>
                      {message.senderName}:{' '}
                      <span
                        dangerouslySetInnerHTML={{
                          __html: message.content,
                        }}
                      />
                    </MessageItem>
                  ))}
              </MessageList>
            </WrapperDiv>
            <WrapperDiv2>
              <MessageInput
                selectedUser={selectedUser}
                selectedGroup={selectedGroup}
                onMessageSubmit={handleNewMessage}
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
