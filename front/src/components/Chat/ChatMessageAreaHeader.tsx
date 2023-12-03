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
import { ChannelMessage, UserInfo, ChannelData } from '../../interfaces/chat-channel-data.interface';

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
}

const ChatMessageAreaHeader: React.FC<ChatMessageAreaHeaderProps> = ({
  user,
  group,
  socket,
  navigateToEmptyChat,
  updateUserSidebar,
  onNewMessage,
  channelData
}) => {
  const [friendProfileToShow, setFriendProfileToShow] =
    useState<FriendData | null>(null);

  const [showAddNewFriendFlow, setShowAddNewFriendFlow] =
    useState<boolean>(false);

  const { userData } = useUserData();

  //const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const { fetchChannelData } = useChannelData();
  
  const { userFriends, setUserFriends, fetchFriendsList, isFetchingFriends } =
  useUserFriends();
  
  const friend =
  userFriends.find((userFriend) => userFriend.username === user?.username) ||
  null;
  
  const [isPopupVisible, setPopupVisible] = useState(false);
  const { launchFlashMessage } = useFlashMessages();

  const [channelUsersInfo, setChannelUsersInfo] = useState<UserInfo[] | null>(null);
  const [channelOwnerInfo, setChannelOwnerInfo] = useState<UserInfo[] | null>(null);
  //const [channelUsersInfo, setUserIntraIds] = useState<UserInfo[] | null>(null);
  //const [channelUsersInfo, setUserIntraIds] = useState<UserInfo[] | null>(null);


  useEffect(() => {
    fetchFriendsList();
    // const getchChannelData = async () => {
    //   const data = await fetchChannelData(group?.name || '');
    //   setChannelData(data);
    // };
    // getchChannelData();
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

  const setAdmin = (intraId: number) => {
    console.log('set admin');
  };

  const mute = (intraId: number) => {
    console.log('mute');
  };

  const kick = (intraId: number) => {
    console.log('kick');
  };

  const ban = (intraId: number) => {
    console.log('ban');
  };

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
          {user?.username || group?.name || ''}
          {group?.type === 'PROTECTED' && <span> 🔐</span>}
          {group?.type === 'PRIVATE' && <span> 🔒</span>}
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
          <MainButtonStyled onClick={() => console.log('Block button clicked')}>
            Block
          </MainButtonStyled>
        </div>
      )}
      {group && (
        <div>
          <MainButtonStyled
            onClick={() => {
              setChannelUsersInfo(channelData?.usersInfo || []);
              setPopupVisible(true);
            }}
          >
            Actions
          </MainButtonStyled>
          {channelUsersInfo && isPopupVisible && (
            <Modal
            dismissModalAction={() => {
              setPopupVisible(false);
              setChannelUsersInfo([]);
            }}
            >
            {/* Display the user intra ids here */}
            {channelUsersInfo.map((channelUserInfo) => {
              console.log('users in this channel:', channelUsersInfo);
              // Skip the logged-in user
              if (channelUserInfo.intra === userData?.intraId) {
                return null;
              }

              return (
                <div key={channelUserInfo.intra}>
                  {channelUserInfo.username}
                  {/*If there is time, change to svg*/}
                  <MainButton onClick={() => setAdmin(channelUserInfo.intra)}>Set Admin</MainButton>
                  <MainButton onClick={() => mute(channelUserInfo.intra)}>Mute</MainButton>
                  <MainButton onClick={() => kick(channelUserInfo.intra)}>Kick</MainButton>
                  <MainButton onClick={() => ban(channelUserInfo.intra)}>Ban</MainButton>
                </div>
              );
            })}
            </Modal>
          )}
          <MainButtonStyled
            onClick={() => console.log('Protect button clicked')}
          >
            Password
          </MainButtonStyled>
          <MainButtonStyled
            onClick={() => {
              handleLeaveChannel(group.name);
              updateUserSidebar();
            }}
          >
            Leave Channel
          </MainButtonStyled>
        </div>
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
