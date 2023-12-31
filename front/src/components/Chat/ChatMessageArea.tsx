import React, { useEffect } from 'react';
import styled from 'styled-components';
import Group from '../../interfaces/chat-group.interface';
import User from '../../interfaces/chat-user.interface';
import DirectMessage from '../../interfaces/chat-message.interface';
import GroupMessage from '../../interfaces/chat-group-message.interface';
import MessageInput from './ChatMessageAreaInput';
import ChatMessageAreaHeader from './ChatMessageAreaHeader';
import { Socket } from 'socket.io-client';
import GradientBorder from '../UI/GradientBorder';
import { darkerBgColor } from '../../constants/color-tokens';
import { ChannelData } from '../../interfaces/chat-channel-data.interface';
import ChatMessageAreaList from './ChatMessageAreaList';
import ChatAnimationData from '../../assets/lotties/chat.json';
import Lottie from 'lottie-react';
import { fetchAuthorized, getBaseUrl } from '../../utils/utils';
import Cookies from 'js-cookie';
import { sm } from '../../constants/styles';
import { useUserData } from '../../context/UserDataContext';

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
  setMessages: React.Dispatch<React.SetStateAction<DirectMessage[]>>;
  onNewAction: (intraId: number | undefined, selectedGroup: Group) => void;
}

const MessageAreaContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media (max-width: ${sm}) {
    min-height: 80vh;
  }

  .gradient-border {
    background-color: ${darkerBgColor};
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    min-width: 50%; // Fix issue with responsive
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

  > p {
    text-align: center;
  }

  .chat-lottie {
    width: 100%;
    max-width: 400px;
  }
`;

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
  setMessages,
  onNewAction,
}) => {
  const [mutedUsers, setMutedUsers] = React.useState<{ username: string }[]>(
    [],
  );

  const { userData } = useUserData();

  useEffect(() => {
    if (selectedGroup?.id) {
      fetchAuthorized(`${getBaseUrl()}/chat/${selectedGroup.id}/mutedUsers`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          setMutedUsers(data.data);
        });
    }
  }, [messages, selectedGroup]);

  const handleNewMessage = (newMessage: DirectMessage | GroupMessage) => {
    if (socket) {
      if (selectedUser) socket.emit('privateMessage', newMessage);
      else if (selectedGroup) socket.emit('sendMessageToRoom', newMessage);

      onNewMessage(newMessage);
    }
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
              setSelectedGroup={setSelectedGroup}
              updateUserSidebar={updateUserSidebar}
              onNewMessage={handleNewMessage}
              channelData={channelData}
              users={users}
              setUsers={setUsers}
              setMessages={setMessages}
              onNewAction={() =>
                onNewAction(userData?.intraId, selectedGroup as Group)
              }
            />
            <div className="message-list-container">
              <ChatMessageAreaList
                messages={messages}
                mutedUsers={mutedUsers}
                selectedUser={selectedUser}
                selectedGroup={selectedGroup}
              />
            </div>
            <div>
              <MessageInput
                selectedUser={selectedUser}
                selectedGroup={selectedGroup}
                mutedUsers={mutedUsers}
                onMessageSubmit={handleNewMessage}
              />
            </div>
          </WrapperDiv>
        ) : (
          <CenteredContainer>
            <p className="title-2 mb-16">
              Chat with your friends
              <br />
              or participate in our community channels!
            </p>
            <Lottie animationData={ChatAnimationData} className="chat-lottie" />
          </CenteredContainer>
        )}
      </GradientBorder>
    </MessageAreaContainer>
  );
};

export default ChatMessageArea;
