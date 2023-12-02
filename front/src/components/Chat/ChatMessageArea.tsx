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
import ScrollIntoViewIfNeeded from 'react-scroll-into-view-if-needed';

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
  }
`;

const WrapperDiv = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;

  .message-list-container {
    overflow-y: auto;
  }
`;

const MessageList = styled.ul`
  list-style: none;
  padding: 0;
`;

const MessageItem = styled.li`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;

  margin-bottom: 15px;

  .avatar {
    width: 30px;
    height: 30px;
    border-radius: 4px;
    margin-right: 8px;
  }

  .message-container {
    .message-header {
      display: flex;
      justify-content: flex-start;
      align-items: baseline;

      .username {
        font-weight: bold;
        line-height: 1;
        margin-bottom: 6px;
        margin-right: 8px;
      }

      .timestamp {
        opacity: 0.7;
        font-size: 0.8rem;
      }
    }
    a {
      color: ${primaryAccentColor};
    }
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
          <WrapperDiv>
            <ChatMessageAreaHeader
              user={selectedUser}
              group={selectedGroup}
              socket={socket}
              navigateToEmptyChat={navigateToEmptyChat}
              updateUserSidebar={updateUserSidebar}
              onNewMessage={handleNewMessage}
            />
            <div className="message-list-container">
              <MessageList>
                {messages &&
                  selectedUser &&
                  messages.length > 0 &&
                  messages.map((message) => {
                    return (
                      <ScrollIntoViewIfNeeded>
                        <MessageItem key={message.id}>
                          <img
                            src={message.senderAvatar}
                            alt=""
                            className="avatar"
                          />
                          <div className="message-container">
                            <div className="message-header">
                              <p className="username">{message.senderName}</p>
                              <p className="timestamp">
                                {new Date(
                                  Date.parse(message.createdAt as string),
                                ).toLocaleString('us-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: 'numeric',
                                })}
                              </p>
                            </div>
                            <p
                              dangerouslySetInnerHTML={{
                                __html: message.content,
                              }}
                            />
                          </div>
                        </MessageItem>
                      </ScrollIntoViewIfNeeded>
                    );
                  })}
              </MessageList>
            </div>
            <div>
              <MessageInput
                selectedUser={selectedUser}
                selectedGroup={selectedGroup}
                onMessageSubmit={handleNewMessage}
              />
            </div>
          </WrapperDiv>
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
