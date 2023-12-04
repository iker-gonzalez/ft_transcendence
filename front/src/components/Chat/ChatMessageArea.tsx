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
import { darkerBgColor } from '../../constants/color-tokens';
import { ChannelData } from '../../interfaces/chat-channel-data.interface';
import ChatMessageAreaList from './ChatMessageAreaList';

interface ChatMessageAreaProps {
  selectedUser: User | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
  selectedGroup: Group | null;
  setSelectedGroup: React.Dispatch<React.SetStateAction<Group | null>>;
  messages: DirectMessage[];
  onNewMessage: (message: DirectMessage | GroupMessage) => void;
  updateUserSidebar: () => void;
  socket: Socket | null;
  channelData: ChannelData | null;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

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
    height: 100%;
    overflow-y: auto;
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
  channelData,
  users,
  setUsers,
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
              setSelectedUser={setSelectedUser}
              group={selectedGroup}
              socket={socket}
              navigateToEmptyChat={navigateToEmptyChat}
              updateUserSidebar={updateUserSidebar}
              onNewMessage={handleNewMessage}
              channelData={channelData}
              users={users}
              setUsers={setUsers}
            />
            <div className="message-list-container">
              <ChatMessageAreaList
                messages={messages}
                selectedUser={selectedUser}
              />
            </div>
            <div>
              <MessageInput
                selectedUser={selectedUser}
                selectedGroup={selectedGroup}
                mutedUsers={channelData?.mutedInfo || []}
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
