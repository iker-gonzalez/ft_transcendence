import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MainButton from '../UI/MainButton';
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
import {
  UserInfo,
  ChannelData,
} from '../../interfaces/chat-channel-data.interface';
import {
  patchChannelPassword,
  patchMuteUser,
  setAdminIntra,
  patchBlockUser,
} from '../../utils/utils';
import DangerButton from '../UI/DangerButton';
import { useMessageData } from '../../context/ChatDataContext';
import ChatMessageAreaHeaderName from './ChatMessageAreaHeaderName';
import ChatMessageAreaHeaderConvoActions from './ChatMessageAreaHeaderConvoActions';

interface ChatMessageAreaHeaderProps {
  user?: User | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
  group?: Group | null;
  socket: Socket | null;
  navigateToEmptyChat: () => void;
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

  .user-info-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 4px;
    }
  }

  .actions-container {
    display: flex;
    align-items: center;
    gap: 16px;
  }
`;

const MainButtonStyled = styled(MainButton)`
  margin-left: 15px;
  margin-bottom: 25px;
  margin-top: 15px;
  margin-right: 15px;
`;

const ChatMessageAreaHeader: React.FC<ChatMessageAreaHeaderProps> = ({
  user,
  setSelectedUser,
  group,
  socket,
  navigateToEmptyChat,
  updateUserSidebar,
  onNewMessage,
  channelData,
  users,
  setUsers,
  setMessages,
  onNewAction,
}) => {
  const [showFriendProfile, setShowFriendProfile] = useState<boolean>(false);

  // console.log('channel data:', channelData);
  // console.log('grop data:', channelData);
  // console.log('users with DM:', users);

  const { userData } = useUserData();
  const { fetchUserMessages } = useMessageData();
  const [password, setPasswordInput] = useState('');

  //const [channelData, setChannelData] = useState<ChannelData | null>(null);
  // const { fetchChannelData } = useChannelData();
  const mutedUsers = channelData?.mutedInfo || [];
  const mutedUsersIntraIds = mutedUsers.map((user) => user.intra);
  //const isMuted = mutedUsersIntraIds.includes(userData?.intraId || 0);

  const adminUsers = channelData?.adminsInfo || [];
  const adminUsersIntraIds = adminUsers.map((user) => user.intra);

  const { userFriends, fetchFriendsList } = useUserFriends();

  const friend = userFriends.find(
    (userFriend) => userFriend.username === user?.username,
  );

  const [isPopupVisible, setPopupVisible] = useState(false);
  const [isPasswordPopupVisible, setPasswordPopupVisible] = useState(false);
  const { launchFlashMessage } = useFlashMessages();

  const [channelUsersInfo, setChannelUsersInfo] = useState<UserInfo[] | null>(
    null,
  );
  const [channelOwnerIntraId, setChannelOwnerIntraId] = useState<number | null>(
    null,
  );
  const [channelAdminsInfo, setChannelAdminsInfo] = useState<UserInfo[] | null>(
    null,
  );
  const [channelBannedInfo, setChannelBannedInfo] = useState<UserInfo[] | null>(
    null,
  );
  const [channelMutedInfo, setChannelMutedInfo] = useState<UserInfo[] | null>(
    null,
  );

  useEffect(() => {
    if (channelData) {
      setChannelUsersInfo(channelData.usersInfo || []);
      setChannelOwnerIntraId(channelData.ownerIntra || null);
      setChannelAdminsInfo(channelData.adminsInfo || null);
      setChannelBannedInfo(channelData.bannedInfo || null);
      setChannelMutedInfo(channelData.mutedInfo || null);
    }
  }, [group, channelData]);

  useEffect(() => {
    fetchFriendsList();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLeaveChannel = (roomName: string) => {
    if (roomName.trim() !== '' && roomName && socket) {
      const payload = {
        roomName: roomName,
        intraId: userData?.intraId,
      };

      socket.emit('leaveRoom', payload);

      launchFlashMessage(
        `You have successfully left the room ${roomName}!`,
        FlashMessageLevel.SUCCESS,
      );
      navigateToEmptyChat();
    }
  };

  const setPassword = async (password: string | null) => {
    const status_code = await patchChannelPassword(
      channelData!.roomName || '',
      channelOwnerIntraId || 0,
      password,
    );
    if (status_code === 200) {
      launchFlashMessage(
        `You have successfully ${
          password ? 'set' : 'removed'
        } the password for the channel ${channelData!.roomName || ''}.`,
        FlashMessageLevel.SUCCESS,
      );
    } else {
      launchFlashMessage(
        `Something went wrong. Try again later.`,
        FlashMessageLevel.ERROR,
      );
    }
  };

  const setAdmin = async (intraId: number, isAdmin: number) => {
    const status_code = await setAdminIntra(
      channelData!.roomName || '',
      intraId,
      channelOwnerIntraId || 0,
      isAdmin,
    );
    if (status_code === 200) {
      launchFlashMessage(
        `You have successfully ${
          isAdmin ? 'set' : 'removed'
        } the admin role for the user ${intraId}.`,
        FlashMessageLevel.SUCCESS,
      );
    } else {
      launchFlashMessage(
        `Something went wrong. Try again later.`,
        FlashMessageLevel.ERROR,
      );
    }
  };

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
          const directMessages: DirectMessage[] = await fetchUserMessages(user);
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

  const mute = async (muteIntraId: number, isMuted: number) => {
    const status_code = await patchMuteUser(
      channelData!.roomName || '',
      muteIntraId,
      channelOwnerIntraId || 0,
      isMuted,
    );
    if (status_code === 200) {
      launchFlashMessage(
        `You have successfully ${
          isMuted ? 'muted' : 'unmuted'
        } the user ${muteIntraId}.`,
        FlashMessageLevel.SUCCESS,
      );
    } else {
      launchFlashMessage(
        `Something went wrong. Try again later.`,
        FlashMessageLevel.ERROR,
      );
    }
  };

  const kick = (intraId: number) => {
    console.log('kick');
    //socket
  };

  const ban = (intraId: number) => {
    console.log('ban');
    //socket
  };

  // console.log('users in this channel:', channelUsersInfo);
  // console.log('owner in this channel:', channelOwnerIntraId);
  console.log('admins in this channel:', channelAdminsInfo);
  // console.log('muted in this channel:', channelMutedInfo);
  // console.log('banned in this channel:', channelBannedInfo);

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
      {group &&
        (channelOwnerIntraId === userData?.intraId ||
          channelAdminsInfo?.some(
            (admin) => admin.intra === userData?.intraId,
          )) && (
          <div>
            <MainButtonStyled
              onClick={() => {
                setPopupVisible(true);
              }}
            >
              Actions
            </MainButtonStyled>
            {channelUsersInfo && isPopupVisible && (
              <Modal
                dismissModalAction={() => {
                  setPopupVisible(false);
                }}
              >
                {/* Display the user intra ids here */}
                {channelUsersInfo.map((channelUserInfo) => {
                  // Skip the logged-in user
                  if (channelUserInfo.intra === userData?.intraId) {
                    return null;
                  }
  
                  const isUserMuted = mutedUsersIntraIds?.includes(
                    channelUserInfo.intra,
                  );
                  const isAdmin = adminUsersIntraIds?.includes(
                    channelUserInfo.intra,
                  );
  
                  return (
                    <div key={channelUserInfo.intra}>
                      {channelUserInfo.intra !== channelOwnerIntraId && (
                        <>
                          {channelUserInfo.username}
                          {/*If there is time, change to svg*/}
                          <MainButton
                            onClick={() => {
                              setAdmin(channelUserInfo.intra, isAdmin ? 0 : 1);
                              setPopupVisible(false);
                              onNewAction(group);
                            }}
                          >
                            {isAdmin ? 'Remove Admin' : 'Make Admin'}
                          </MainButton>
                          <MainButton
                            onClick={() => {
                              mute(channelUserInfo.intra, isUserMuted ? 0 : 1);
                              setPopupVisible(false);
                              onNewAction(group);
                            }}
                          >
                            {isUserMuted ? 'Unmute' : 'Mute'}
                          </MainButton>
                          <MainButton
                            onClick={() => kick(channelUserInfo.intra)}
                          >
                            Kick
                          </MainButton>
                          <MainButton
                            onClick={() => ban(channelUserInfo.intra)}
                          >
                            Ban
                          </MainButton>
                        </>
                      )}
                    </div>
                  );
                })}
              </Modal>
            )}
            {group && channelOwnerIntraId === userData?.intraId && (
              <>
                {channelData?.type === 'PUBLIC' ? (
                  <>
                    <MainButtonStyled
                      onClick={() => setPasswordPopupVisible(true)}
                    >
                      Set Password
                    </MainButtonStyled>
  
                    {isPasswordPopupVisible && (
                      <Modal
                        dismissModalAction={() =>
                          setPasswordPopupVisible(false)
                        }
                      >
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPasswordInput(e.target.value)}
                        />
                        <button
                          onClick={() => {
                            setPassword(password);
                            setPasswordInput('');
                            setPasswordPopupVisible(false);
                            onNewAction(group);
                          }}
                        >
                          Submit
                        </button>
                      </Modal>
                    )}
                  </>
                ) : channelData?.type === 'PROTECTED' ? (
                  <>
                    <MainButtonStyled
                      onClick={() => setPasswordPopupVisible(true)}
                    >
                      Modify or Remove Password
                    </MainButtonStyled>
  
                    {isPasswordPopupVisible && (
                      <Modal
                        dismissModalAction={() =>
                          setPasswordPopupVisible(false)
                        }
                      >
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPasswordInput(e.target.value)}
                        />
                        <button
                          onClick={() => {
                            setPassword(password);
                            setPasswordInput('');
                            setPasswordPopupVisible(false);
                            onNewAction(group);
                          }}
                        >
                          Modify Password
                        </button>
                        <button
                          onClick={() => {
                            setPassword(null);
                            setPasswordPopupVisible(false);
                            onNewAction(group);
                          }}
                        >
                          Remove Password
                        </button>
                      </Modal>
                    )}
                  </>
                ) : null}
              </>
            )}
          </div>
        )}
      {group && (
        <DangerButton
          onClick={() => {
            handleLeaveChannel(group.name);
            updateUserSidebar();
          }}
        >
          Leave channel
        </DangerButton>
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
