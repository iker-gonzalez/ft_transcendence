import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useUserFriends, useUserData } from '../../context/UserDataContext';
import ViewNewUserProfile from '../Friends/ViewNewUserProfile';
import Modal from '../UI/Modal';
import { useFlashMessages } from '../../context/FlashMessagesContext';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import Group from '../../interfaces/chat-group.interface';
import User from '../../interfaces/chat-user.interface';
import { Socket } from 'socket.io-client';
import DirectMessage from '../../interfaces/chat-message.interface';
import GroupMessage from '../../interfaces/chat-group-message.interface';
import { ChannelData } from '../../interfaces/chat-channel-data.interface';
import { patchBlockUser } from '../../utils/utils';
import { useMessageData } from '../../context/ChatDataContext';
import ChatMessageAreaHeaderName from './ChatMessageAreaHeaderName';
import ChatMessageAreaHeaderConvoActions from './ChatMessageAreaHeaderConvoActions';
import ChatMessageAreaHeaderChannelActions from './ChatMessageAreaHeaderChannelActions';

interface ChatMessageAreaHeaderProps {
  user?: User | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
  setSelectedGroup: React.Dispatch<React.SetStateAction<Group | null>>;
  group?: Group | null;
  socket: Socket | null;
  updateUserSidebar: () => void;
  onNewMessage: (message: DirectMessage | GroupMessage) => void;
  channelData: ChannelData | null;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setMessages: React.Dispatch<React.SetStateAction<DirectMessage[]>>;
  onNewAction: (selectedGroup: Group) => void;
}

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 8px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid white;

  .actions-container {
    display: flex;
    align-items: center;
    gap: 16px;
  }
`;

const ChatMessageAreaHeader: React.FC<ChatMessageAreaHeaderProps> = ({
  user,
  setSelectedUser,
  setSelectedGroup,
  group,
  socket,
  updateUserSidebar,
  onNewMessage,
  channelData,
  users,
  setUsers,
  setMessages,
  onNewAction,
}) => {
  const [showFriendProfile, setShowFriendProfile] = useState<boolean>(false);
  const { userData } = useUserData();
  const { fetchUserMessages } = useMessageData();
  const { userFriends, fetchFriendsList } = useUserFriends();

  const friend = userFriends.find(
    (userFriend) => userFriend.username === user?.username,
  );

  const { launchFlashMessage } = useFlashMessages();

  useEffect(() => {
    if (channelData) {
    }
  }, [group, channelData]);

  useEffect(() => {
    fetchFriendsList();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const block = async (
    blockUsername: string,
    blockIntraId: number,
    isBlocked: number,
  ) => {
    const status_code = await patchBlockUser(
      userData?.intraId || 0,
      blockIntraId,
      isBlocked,
    );
    if (status_code === 200) {
      setUsers((prevUsers) => {
        return prevUsers.map((user) => {
          if (user.intraId === blockIntraId) {
            return {
              ...user,
              isBlocked: !!isBlocked,
            };
          }
          return user;
        });
      });

      setSelectedUser((prevUser) => {
        if (prevUser?.intraId === blockIntraId) {
          return {
            ...prevUser,
            isBlocked: !!isBlocked,
          };
        }
        return prevUser;
      });

      if (isBlocked === 1) {
        launchFlashMessage(
          `You have successfully ${
            isBlocked === 1 ? 'blocked' : 'unblocked'
          } user ${blockUsername}.`,
          isBlocked === 1 ? FlashMessageLevel.INFO : FlashMessageLevel.SUCCESS,
        );
      } else {
        if (user) {
          // Fetch the user's messages again
          // in case user navigated away when they first blocked
          const directMessages: DirectMessage[] = await fetchUserMessages(user.intraId);
          setMessages(directMessages);
        }
      }
    } else {
      launchFlashMessage(
        `Something went wrong. Try again later.`,
        FlashMessageLevel.ERROR,
      );
    }
  };

  return (
    <HeaderWrapper>
      <ChatMessageAreaHeaderName user={user} channelData={channelData} />
      {user && userData && (
        <ChatMessageAreaHeaderConvoActions
          user={user}
          userData={userData}
          onNewMessage={onNewMessage}
          setShowFriendProfile={setShowFriendProfile}
          block={block}
        />
      )}
      {group && socket && (
        <ChatMessageAreaHeaderChannelActions
          group={group}
          socket={socket}
          userData={userData}
          channelData={channelData}
          onNewAction={onNewAction}
          updateUserSidebar={updateUserSidebar}
          setSelectedGroup={setSelectedGroup}
        />
      )}
      {showFriendProfile && friend && (
        <Modal
          dismissModalAction={() => {
            setShowFriendProfile(false);
          }}
          showFullScreen={true}
        >
          <ViewNewUserProfile
            foundUserData={friend}
            shouldHideFriendCta={true}
          />
        </Modal>
      )}
    </HeaderWrapper>
  );
};
export default ChatMessageAreaHeader;
