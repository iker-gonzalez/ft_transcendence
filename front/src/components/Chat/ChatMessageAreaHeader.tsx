import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MainButton from '../UI/MainButton';
import FriendData from '../../interfaces/friend-data.interface';
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
import { createNewDirectMessage } from '../../utils/utils';
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
import { nanoid } from 'nanoid';
import SecondaryButton from '../UI/SecondaryButton';
import DangerButton from '../UI/DangerButton';

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

interface ChatMessageAreaHeaderProps {
  selectedUser?: User | null;
  selectedGroup?: Group | null;
  socket: Socket | null;
  navigateToEmptyChat: () => void;
  updateUserSidebar: () => void;
  onNewMessage: (message: DirectMessage | GroupMessage) => void;
  channelData: ChannelData | null;
  users: User[];
  onBlockedChange: () => void;
}

const ChatMessageAreaHeader: React.FC<ChatMessageAreaHeaderProps> = ({
  selectedUser,
  selectedGroup,
  socket,
  navigateToEmptyChat,
  updateUserSidebar,
  onNewMessage,
  channelData,
  users,
  onBlockedChange
}) => {
  const [friendProfileToShow, setFriendProfileToShow] =
    useState<FriendData | null>(null);

  // console.log('channel data:', channelData);
  // console.log('grop data:', channelData);
  // console.log('users with DM:', users);

  const [showAddNewFriendFlow, setShowAddNewFriendFlow] =
    useState<boolean>(false);

    // console.log('users:', users);
    
    const { userData } = useUserData();
    const [password, setPasswordInput] = useState('');
    
    const mutedUsers = channelData?.mutedInfo || [];
    const mutedUsersIntraIds = mutedUsers.map((user) => user.intra);
    
    const adminUsers = channelData?.adminsInfo || [];
    const adminUsersIntraIds = adminUsers.map((user) => user.intra);
    
  // console.log('is this user blocked:', user?.isBlocked);
  //const [isBlocked, setIsBlocked] = useState(user?.isBlocked);
  // console.log('is this user blocked:', isBlocked);

  // useEffect(() => {
  //   console.log('entro en el use effect');
  //   //setIsBlocked(user?.isBlocked);
  //   onBlockedChange(isBlocked || false);
  // }, [isBlocked]);

  const { userFriends, setUserFriends, fetchFriendsList, isFetchingFriends } =
    useUserFriends();

  const friend =
    userFriends.find((userFriend) => userFriend.username === selectedUser?.username) ||
    null;

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
  }, [selectedGroup, channelData]);

  useEffect(() => {
    fetchFriendsList();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onUpdateFriendsList = (
    newFriendsList: FriendData[],
    successMessage: string,
  ): void => {
    setUserFriends(newFriendsList);
    setFriendProfileToShow(null);
    setShowAddNewFriendFlow(false);

    launchFlashMessage(successMessage, FlashMessageLevel.SUCCESS);
  };

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

  const setPassword = (password: string | null) => {
    patchChannelPassword(
      channelData!.roomName || '',
      channelOwnerIntraId || 0,
      password,
    );
    // endpoint not working
  };

  const setAdmin = (intraId: number, isAdmin: number) => {
    setAdminIntra(
      channelData!.roomName || '',
      intraId,
      channelOwnerIntraId || 0,
      isAdmin,
    );
    // endpoint not working
  };

  const block = async (blockUsername: string, blockIntraId: number, isBlocked: number) => {
    // console.log('entering block function');
    const status_code = await patchBlockUser(userData?.intraId || 0, blockIntraId, isBlocked);
    if (status_code === 200) {
      //setIsBlocked(prevIsBlocked => !prevIsBlocked);
      if (isBlocked === 1) {
      launchFlashMessage(
        `You have successfully block user ${blockUsername}. You will no longer receive messages from this.`,
        FlashMessageLevel.SUCCESS,
      );
      //setIsBlocked(true);
      // console.log('isBlocked value', isBlocked);
    }
    else {
      launchFlashMessage(
        `You have successfully unblock user ${blockUsername}. You will now receive messages from this.`,
        FlashMessageLevel.SUCCESS,
      );
      //setIsBlocked(false);
      // console.log('isBlocked value', isBlocked);
    }
    onBlockedChange();
  }
  else {
    launchFlashMessage(
      `Something went wrong. Try again later.`,
      FlashMessageLevel.ERROR,
    );
  }
}

  const mute = (muteIntraId: number, isMuted: number) => {
    patchMuteUser(
      channelData!.roomName || '',
      muteIntraId,
      channelOwnerIntraId || 0,
      isMuted,
    );
    // endpoint not working
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
  // console.log('admins in this channel:', channelAdminsInfo);
  // console.log('muted in this channel:', channelMutedInfo);
  // console.log('banned in this channel:', channelBannedInfo);

  return (
    <HeaderWrapper>
      {selectedUser && (
        <div className="user-info-container">
          <img src={selectedUser.avatar} alt={selectedUser.username} className="avatar" />
          <p className="title-2">
            {selectedUser?.username || channelData?.roomName || ''}
            {channelData?.type === 'PROTECTED' && <span> 🔐</span>}
            {channelData?.type === 'PRIVATE' && <span> 🔒</span>}
          </p>
        </div>
      )}
      {selectedUser && (
        <div className="actions-container">
          <MainButton
            onClick={() => {
              if (userData && selectedUser) {
                const invitationUrl =
                  window.location.origin +
                  '/game/invitation' +
                  '?' +
                  `invited=${selectedUser.intraId}` +
                  '&' +
                  `inviter=${userData.intraId}` +
                  '&' +
                  `id=${nanoid()}`;

                const newDirectMessage: DirectMessage = createNewDirectMessage({
                  selectedUser: selectedUser,
                  userData,
                  contentText: `Hey, ${selectedUser.username}! Fancy playing a 1vs1 match together? Click <a href="${invitationUrl}">here</a> to start a new game!`,
                });

                onNewMessage(newDirectMessage);
              } else {
                launchFlashMessage(
                  'Something went wrong. Try again later.',
                  FlashMessageLevel.ERROR,
                );
              }
            }}
          >
            Challenge
          </MainButton>
          <SecondaryButton onClick={() => setFriendProfileToShow(friend)}>
            Profile
          </SecondaryButton>
          <DangerButton
            onClick={() => {
              console.log('block button clicked');
              block(selectedUser.username, selectedUser.intraId, selectedUser.isBlocked ? 0 : 1)}
            }
              
          >
            {selectedUser ? 'Unblock' : 'Block'}
          </DangerButton>
        </div>
      )}
      {selectedGroup &&
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
                      {channelUserInfo.username}
                      {/*If there is time, change to svg*/}
                      <MainButton
                        onClick={() =>
                          setAdmin(channelUserInfo.intra, isAdmin ? 0 : 1)
                        }
                      >
                        {isAdmin ? 'Remove Admin' : 'Make Admin'}
                      </MainButton>
                      <MainButton
                        onClick={() =>
                          mute(channelUserInfo.intra, isUserMuted ? 0 : 1)
                        }
                      >
                        {isUserMuted ? 'Unmute' : 'Mute'}
                      </MainButton>
                      <MainButton onClick={() => kick(channelUserInfo.intra)}>
                        Kick
                      </MainButton>
                      <MainButton onClick={() => ban(channelUserInfo.intra)}>
                        Ban
                      </MainButton>
                    </div>
                  );
                })}
              </Modal>
            )}
            {selectedGroup && channelOwnerIntraId === userData?.intraId && (
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
                            setPasswordPopupVisible(false);
                          }}
                        >
                          Submit
                        </button>
                      </Modal>
                    )}
                  </>
                ) : channelData?.type === 'PROTECTED' ? (
                  <MainButtonStyled
                    onClick={() => {
                      console.log('Unprotect button clicked');
                      setPassword(null);
                    }}
                  >
                    Remove Password
                  </MainButtonStyled>
                ) : null}
              </>
            )}
          </div>
        )}
      {selectedGroup && (
        <DangerButton
          onClick={() => {
            handleLeaveChannel(selectedGroup.name);
            updateUserSidebar();
          }}
        >
          Leave Channel
        </DangerButton>
      )}
      {friendProfileToShow && (
        <Modal
          dismissModalAction={() => {
            setFriendProfileToShow(null);
          }}
          showFullScreen={true}
        >
          <ViewNewUserProfile
            foundUserData={friendProfileToShow}
            isAlreadyFriend={true}
            onUpdateFriendsList={onUpdateFriendsList}
          />
        </Modal>
      )}
    </HeaderWrapper>
  );
};
export default ChatMessageAreaHeader;
