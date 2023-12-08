import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Group from '../../interfaces/chat-group.interface';
import User from '../../interfaces/chat-user.interface';
import { ChannelData } from '../../interfaces/chat-channel-data.interface';
import Modal from '../UI/Modal';
import { useUserFriends, useUserData } from '../../context/UserDataContext';
import GradientBorder from '../UI/GradientBorder';
import {
  darkBgColor,
  darkerBgColor,
  primaryLightColor,
} from '../../constants/color-tokens';
import MainButton from '../UI/MainButton';
import RoundImg from '../UI/RoundImage';
import UserStatusInfo from '../UI/UserStatus';
import { Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import { useFlashMessages } from '../../context/FlashMessagesContext';
import ChatSidebarConvoList from './ChatSidebarConvoList';
import { fetchAuthorized, getBaseUrl } from '../../utils/utils';
import ChatSidebarNewChannelModal from './ChatSidebarNewChannelModal';
import ChatSidebarChannelList from './ChatSidebarChannelList';
import ChatSidebarJoinProtectedModal from './ChatSidebarJoinProtectedModal';
import { useNavigate } from 'react-router-dom';
import ChatSidebarUpdate from '../../interfaces/chat-sidebar-update.interface';

interface SidebarProps {
  selectedUser: User | null;
  selectedGroup: Group | null;
  users: User[];
  userGroups: Group[] | null;
  updateUserSidebar: () => void;
  allGroups: Group[] | null;
  handleUserClick: (user: User) => void;
  handleGroupClick: (group: Group) => void;
  socket: Socket | null;
  channelData: ChannelData | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
  setSelectedGroup: React.Dispatch<React.SetStateAction<Group | null>>;
}

const SidebarContainer = styled.div`
  flex-basis: 30%;
  display: flex;
  height: 81vh;

  .gradient-border {
    flex-grow: 1;
    background-color: ${darkerBgColor};
    padding: 20px;
    overflow-y: auto;
  }
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  margin-bottom: 20px;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  margin-bottom: 8px;
`;

const PlusSign = styled.button`
  width: 30px;
  height: 30px;

  border-radius: 6px;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 28px;
  color: ${primaryLightColor};
  background: none;
  cursor: pointer;
  margin-left: 10px;

  &:hover {
    background-color: ${darkBgColor};
    transition: background-color 0.3s;
  }
`;

const Title = styled.h2`
  font-size: 16px;
  font-weight: bold;
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 8px;

  margin-left: 10px;
`;

const ListItem = styled.li`
  padding: 8px 0;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: '20px';
`;

const RoundImgStyled = styled(RoundImg)`
  width: 50px;
  height: 50px;
  margin-right: 10px;
`;

const UserInfo = styled.div`
  flex: 1;
  margin-right: 10px;
`;

const Username = styled.h3`
  font-size: 1.5em;
`;

const Sidebar: React.FC<SidebarProps> = ({
  users,
  userGroups,
  updateUserSidebar,
  allGroups,
  handleUserClick,
  handleGroupClick,
  selectedUser,
  selectedGroup,
  socket,
  channelData,
  setSelectedUser,
  setSelectedGroup,
}) => {
  const navigate = useNavigate();
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [isPasswordPopupVisible, setPasswordPopupVisible] = useState(false);
  const [activeModalContent, setActiveModalContent] = useState<
    'directMessages' | 'groupChats'
  >('directMessages');
  const [roomName, setRoomName] = useState('');
  const { userFriends, fetchFriendsList } = useUserFriends();
  const { userData, fetchUserData } = useUserData();
  const { launchFlashMessage } = useFlashMessages();
  const [groupNature, setGroupNature] = useState('PUBLIC');
  const [password, setPassword] = useState('');
  const [isRoomNameValid, setIsRoomNameValid] = useState(true);
  const [wasSectionUpdated, setWasSectionUpdated] =
    useState<ChatSidebarUpdate>(null);

  const [selectedProtectedGroupToJoin, setSelectedProtectedGroupToJoin] =
    useState<Group | null>(null);

  useEffect(() => {
    fetchFriendsList();
    const token = Cookies.get('token');
    fetchUserData(token as string);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleJoinRoom = async (
    newGroup: Group,
    password: string,
    isNewGroup: boolean,
  ) => {
    if (newGroup.name && socket) {
      const payload = {
        roomName: newGroup.name,
        intraId: userData?.intraId,
        type: newGroup.type,
        password: password,
      };
      if (newGroup.type === 'PROTECTED' && !isNewGroup) {
        const { status } = await fetchAuthorized(
          `${getBaseUrl()}/chat/${password}/${newGroup.name}/isPasswordCorrect`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${Cookies.get('token')}`,
            },
          },
        );
        if (status !== 200) {
          launchFlashMessage(
            `The password you entered is wrong.`,
            FlashMessageLevel.ERROR,
          );
          return 1;
        }
      }

      socket.emit('joinRoom', payload);
      setPopupVisible(false);
      launchFlashMessage(
        `You joined channel ${newGroup.name}!`,
        FlashMessageLevel.SUCCESS,
      );
      return 0;
    } else {
      launchFlashMessage(
        `An error occured while joining the room ${newGroup.name}. Please try again.`,
        FlashMessageLevel.ERROR,
      );
      return 1;
    }
  };

  const userFriendsConverted = userFriends.map((friend) => ({
    intraId: friend.intraId,
    avatar: friend.avatar,
    username: friend.username,
    isBlocked: friend.isBlocked,
  }));

  return (
    <SidebarContainer>
      <GradientBorder className="gradient-border">
        <UserList>
          <TitleContainer>
            <Title>Messages</Title>
            <PlusSign
              onClick={() => {
                setPopupVisible(true);
                setActiveModalContent('directMessages');
              }}
            >
              +
            </PlusSign>
          </TitleContainer>
          <div style={{ overflow: 'hidden' }}>
            <List className="animate__animated animate__fadeInDown">
              <ChatSidebarConvoList
                users={users}
                handleUserClick={handleUserClick}
                updateUserSidebar={updateUserSidebar}
                wasSectionUpdated={wasSectionUpdated}
                setWasSectionUpdated={setWasSectionUpdated}
                setSelectedUser={setSelectedUser}
                setSelectedGroup={setSelectedGroup}
              />
            </List>
          </div>
        </UserList>
        {isPopupVisible && (
          <Modal
            dismissModalAction={() => {
              setPopupVisible(false);
              // Reset inputs
              setRoomName('');
              setGroupNature('PUBLIC');
              setPassword('');
            }}
          >
            {activeModalContent === 'directMessages' ? (
              <>
                <h1 className="title-1 mb-8">New direct message</h1>
                {userFriendsConverted.length > 0 ? (
                  <p className="mb-24">
                    Start chatting now with one of your friends.
                  </p>
                ) : (
                  <>
                    <p className="mb-24">
                      You can only chat with users in your friends list.
                      <br />
                      Go to your profile and find some friends to chat with!
                    </p>
                    <MainButton
                      onClick={() => {
                        navigate('/profile');
                      }}
                    >
                      Go to profile
                    </MainButton>
                  </>
                )}
                <List>
                  {userFriendsConverted.length > 0 &&
                    userFriendsConverted
                      .sort((a, b) => a.username.localeCompare(b.username))
                      .map((friend) => (
                        <ListItem
                          key={friend.intraId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <RoundImgStyled src={friend.avatar} alt="" />
                          <UserInfo>
                            <Username>{friend.username}</Username>
                          </UserInfo>
                          <UserStatusInfo intraId={friend.intraId} />
                          <MainButton
                            onClick={() => {
                              handleUserClick(friend);
                              setPopupVisible(false);
                            }}
                            style={{
                              marginLeft: '24px',
                            }}
                          >
                            Chat
                          </MainButton>
                        </ListItem>
                      ))}
                </List>
              </>
            ) : (
              <ChatSidebarNewChannelModal
                roomName={roomName}
                setRoomName={setRoomName}
                isRoomNameValid={isRoomNameValid}
                setIsRoomNameValid={setIsRoomNameValid}
                allGroups={allGroups}
                groupNature={groupNature}
                setGroupNature={setGroupNature}
                password={password}
                setPassword={setPassword}
                handleJoinRoom={handleJoinRoom}
                updateUserSidebar={updateUserSidebar}
                userGroups={userGroups}
                setPopupVisible={setPopupVisible}
                setPasswordPopupVisible={setPasswordPopupVisible}
                setSelectedProtectedGroupToJoin={
                  setSelectedProtectedGroupToJoin
                }
                handleGroupClick={handleGroupClick}
                socket={socket}
              />
            )}
          </Modal>
        )}
        {isPasswordPopupVisible && (
          <Modal dismissModalAction={() => setPasswordPopupVisible(false)}>
            <ChatSidebarJoinProtectedModal
              handleJoinRoom={handleJoinRoom}
              setPasswordPopupVisible={setPasswordPopupVisible}
              selectedProtectedGroupToJoin={selectedProtectedGroupToJoin}
              updateUserSidebar={updateUserSidebar}
            />
          </Modal>
        )}
        <UserList>
          <TitleContainer>
            <Title>Channels</Title>
            <PlusSign
              onClick={() => {
                setPopupVisible(true);
                setActiveModalContent('groupChats');
              }}
            >
              +
            </PlusSign>
          </TitleContainer>
          <div style={{ overflow: 'hidden' }}>
            <List className="animate__animated animate__fadeInDown">
              {userGroups && (
                <ChatSidebarChannelList
                  userGroups={userGroups}
                  handleGroupClick={handleGroupClick}
                  wasSectionUpdated={wasSectionUpdated}
                  setWasSectionUpdated={setWasSectionUpdated}
                  setSelectedUser={setSelectedUser}
                  setSelectedGroup={setSelectedGroup}
                />
              )}
            </List>
          </div>
        </UserList>
      </GradientBorder>
    </SidebarContainer>
  );
};

export default Sidebar;
