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
import { darkBgColor, primaryColor } from '../../constants/color-tokens';
import UsersIcon from '../../assets/svg/users.svg';

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
  onNewAction: (intraId: number | undefined, selectedGroup: Group) => void;
}

const HeaderWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  padding: 8px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid white;

  .actions-container {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .users-count {
    border: 2px solid ${primaryColor};
    background-color: ${primaryColor};
    border-radius: 8px;

    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: nowrap;

    cursor: help;

    .counter {
      padding: 2px 8px;
      background-color: ${darkBgColor};
      border-radius: 6px 0 0 6px;
      font-weight: bold;
      line-height: 1;
    }

    .icon {
      height: 20px;
      object-fit: contain;
      padding: 1px 6px;
    }
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
  }, [group]); // eslint-disable-line react-hooks/exhaustive-deps

  const block = async (blockIntraId: number, isBlocked: number) => {
    const status_code = await patchBlockUser(
      userData?.intraId || 0,
      blockIntraId,
      isBlocked,
    );
    if (status_code === 200) {
      socket?.emit('update', {
        updatedIntraId: blockIntraId,
      });

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
          `You blocked ${user ? user.username : 'this user'}.`,
          FlashMessageLevel.SUCCESS,
        );
      } else {
        if (user) {
          // Fetch the user's messages again
          // in case user navigated away when they first blocked
          const directMessages: DirectMessage[] = await fetchUserMessages(
            user.intraId,
          );
          if (directMessages) setMessages(directMessages);

          launchFlashMessage(
            `You unblocked ${user.username}.`,
            FlashMessageLevel.SUCCESS,
          );
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
      <ChatMessageAreaHeaderName
        user={user}
        channelData={channelData}
        setShowFriendProfile={setShowFriendProfile}
      />
      {(() => {
        if (channelData && group) {
          const { usersInfo } = channelData;

          const sortedUsersList = usersInfo
            .map((user) => user.username)
            .sort((a, b) => a.localeCompare(b))
            .join(', ');

          return (
            <div className="users-count" title={sortedUsersList}>
              <p aria-label={`${usersInfo.length} members`} className="counter">
                {usersInfo.length}
              </p>
              <img src={UsersIcon} alt="" className="icon" />
            </div>
          );
        }

        return <></>;
      })()}
      {user && userData && (
        <ChatMessageAreaHeaderConvoActions
          user={user}
          userData={userData}
          onNewMessage={onNewMessage}
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
