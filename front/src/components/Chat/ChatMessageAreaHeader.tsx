import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MainButton from '../UI/MainButton';
import RoundImg from '../UI/RoundImage';
import FriendData from '../../interfaces/friend-data.interface';
import { useUserFriends, useUserData } from '../../context/UserDataContext';
import ViewNewUserProfile from '../Friends/ViewNewUserProfile';
import Modal from '../UI/Modal';
import { useFlashMessages } from '../../context/FlashMessagesContext';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import Group from '../../interfaces/chat-group.interface';
import User from '../../interfaces/chat-user.interface';
import { Socket } from 'socket.io-client';
import { useChannelData } from '../../context/ChatDataContext';
import SVG from 'react-inlinesvg';
import DirectMessage from '../../interfaces/chat-message.interface';
import GroupMessage from '../../interfaces/chat-group-message.interface';
import { createNewDirectMessage } from '../../utils/utils';
import {
  ChannelMessage,
  UserInfo,
  ChannelData,
} from '../../interfaces/chat-channel-data.interface';
import {
  patchChannelPassword,
  patchMuteUser,
  setAdminIntra,
  patchBlockUser
} from '../../utils/utils';

const HeaderWrapper = styled.div`
  position: relative; // Add this line
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  border-bottom: 1px solid white;
`;

const Title = styled.h2`
  font-size: 33px;
  font-weight: bold;
  margin-bottom: 10px;
  margin-left: 90px; // Add this line
`;
const Avatar = styled(RoundImg)`
  position: absolute; // Add this line
  left: 15px; // Add this line
  top: 5px; // Add this line
  width: 60px;
  height: 60px;
  margin-right: 0px;
`;

const MainButtonStyled = styled(MainButton)`
  margin-left: 15px;
  margin-bottom: 25px;
  margin-top: 15px;
  margin-right: 15px;
`;

const StyledSVG = styled(SVG)`
  width: 10px; // Adjust as needed
  height: 10px; // Adjust as needed
`;

interface ChatMessageAreaHeaderProps {
  user?: User | null;
  group?: Group | null;
  socket: Socket | null;
  navigateToEmptyChat: () => void;
  updateUserSidebar: () => void;
  onNewMessage: (message: DirectMessage | GroupMessage) => void;
  channelData: ChannelData | null;
  users: User[];
}

const ChatMessageAreaHeader: React.FC<ChatMessageAreaHeaderProps> = ({
  user,
  group,
  socket,
  navigateToEmptyChat,
  updateUserSidebar,
  onNewMessage,
  channelData,
  users,
}) => {
  const [friendProfileToShow, setFriendProfileToShow] =
    useState<FriendData | null>(null);

  console.log('channel data:', channelData);
  console.log('grop data:', channelData);
  console.log('users with DM:', users);

  const [showAddNewFriendFlow, setShowAddNewFriendFlow] =
    useState<boolean>(false);

  const { userData } = useUserData();
  const [password, setPasswordInput] = useState('');

  //const [channelData, setChannelData] = useState<ChannelData | null>(null);
  // const { fetchChannelData } = useChannelData();
  const mutedUsers = channelData?.mutedInfo || [];
  const mutedUsersIntraIds = mutedUsers.map((user) => user.intra);
  //const isMuted = mutedUsersIntraIds.includes(userData?.intraId || 0);

  const adminUsers = channelData?.adminsInfo || [];
  const adminUsersIntraIds = adminUsers.map((user) => user.intra);

  const { userFriends, setUserFriends, fetchFriendsList, isFetchingFriends } =
    useUserFriends();

  const friend =
    userFriends.find((userFriend) => userFriend.username === user?.username) ||
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
  }, [group, channelData]);

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
  };

  const block = (blockIntraId: number, isBlocked: number) => {
    patchBlockUser(
      userData?.intraId || 0,
      blockIntraId,
      isBlocked,
    )
  };

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

  console.log('users in this channel:', channelUsersInfo);
  console.log('owner in this channel:', channelOwnerIntraId);
  console.log('admins in this channel:', channelAdminsInfo);
  console.log('muted in this channel:', channelMutedInfo);
  console.log('banned in this channel:', channelBannedInfo);

  return (
    <HeaderWrapper>
      <div>
        {user && <Avatar src={user.avatar} alt={user.username} />}
        <Title
          style={{
            marginLeft: group ? '0' : '',
            marginBottom: group ? '15px' : '',
          }}
        >
          {user?.username || channelData?.roomName || ''}
          {channelData?.type === 'PROTECTED' && <span> 🔐</span>}
          {channelData?.type === 'PRIVATE' && <span> 🔒</span>}
        </Title>
      </div>
      {user && (
        <div>
          <MainButtonStyled
            onClick={() => {
              if (userData && user) {
                const newDirectMessage: DirectMessage = createNewDirectMessage({
                  selectedUser: user,
                  userData,
                  contentText: `Hey, ${user.username}! Fancy playing a 1vs1 match together? Click <a href="${window.location.origin}/game">here</a> to start a new game!`,
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
            Play
          </MainButtonStyled>
          <MainButtonStyled onClick={() => setFriendProfileToShow(friend)}>
            Profile
          </MainButtonStyled>
          <MainButtonStyled onClick={() => block(user.intraId, user.isBlocked ? 0 : 1)}>
            {user.isBlocked ? 'Unblock' : 'Block'}
          </MainButtonStyled>
        </div>
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
      {group && (
        <MainButtonStyled
          onClick={() => {
            handleLeaveChannel(group.name);
            updateUserSidebar();
          }}
        >
          Leave Channel
        </MainButtonStyled>
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
