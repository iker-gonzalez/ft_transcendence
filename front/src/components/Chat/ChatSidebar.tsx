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
  primaryAccentColor,
} from '../../constants/color-tokens';
import MainButton from '../UI/MainButton';
import RoundImg from '../UI/RoundImage';
import UserStatusInfo from '../UI/UserStatus';
import { Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import { useFlashMessages } from '../../context/FlashMessagesContext';
import MainInput from '../UI/MainInput';
import MainSelect from '../UI/MainSelect';
import ChatSidebarConvoList from './ChatSidebarConvoList';
import { checkIfPasswordIsValid } from '../../utils/utils';

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
  color: ${primaryAccentColor};
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
  list-style: none;

  display: flex;
  flex-direction: column;
  gap: 8px;
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
}

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
}) => {
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
  const [channelOwnerIntraId, setChannelOwnerIntraId] = useState<number | null>(
    null,
  );

  const [selectedProtectedGroup, setSelectedProtectedGroup] =
    useState<Group | null>(null);

  useEffect(() => {
    if (channelData) {
      setChannelOwnerIntraId(channelData.ownerIntra || null);
    }
  }, [selectedGroup, channelData]);

  useEffect(() => {
    fetchFriendsList();
    const token = Cookies.get('token');
    fetchUserData(token as string);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleJoinRoom = async (newGroup: Group, password: string) => {
    console.log('handleJoinRoom');
    if (newGroup.name.trim() !== '' && newGroup.name && socket) {
      const payload = {
        roomName: newGroup.name,
        intraId: userData?.intraId,
        type: newGroup.type,
        password: password,
      };
      if (newGroup.type === 'PROTECTED') {
        const passwordCheckResult = await checkChannelPassword(
          newGroup,
          password,
        );
        if (passwordCheckResult !== 200) {
          launchFlashMessage(
            `The password you entered is incorrect. Please try again.`,
            FlashMessageLevel.ERROR,
          );
          return 1;
        }
      }
      socket.emit('joinRoom', payload);
      setPopupVisible(false);
      launchFlashMessage(
        `You have successfully joined the room ${newGroup.name}!`,
        FlashMessageLevel.SUCCESS,
      );
      return 0;
    }
  };

  const checkChannelPassword = async (group: Group, password: string) => {
    if (password.trim() === '') {
      launchFlashMessage(
        `Please enter a password to join the group ${group.name}.`,
        FlashMessageLevel.ERROR,
      );
      return -1;
    }
    const status_code = await checkIfPasswordIsValid(
      group.name,
      password,
      channelData!.ownerIntra,
    );
    console.log('status_code:', status_code);
    return status_code;
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
          <List>
            <ChatSidebarConvoList
              users={users}
              handleUserClick={handleUserClick}
              updateUserSidebar={updateUserSidebar}
            />
          </List>
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
                <h1 className="title-1 mb-16">Send new message</h1>
                <p className="mb-24">Chat with one of your friends</p>
                <List>
                  {userFriendsConverted.length > 0 ? (
                    userFriendsConverted.map((friend) => (
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
                    ))
                  ) : (
                    <p>
                      It seems you do not have any friends yet. Go to your
                      profile and find some friends to chat with!
                    </p>
                  )}
                </List>
              </>
            ) : (
              <>
                <h1 className="title-1 mb-24">Create new channel</h1>
                <div className="mb-16">
                  <p className="mb-8">
                    You can create a public channel for maximum outreach or make
                    it private for increased privacy.
                  </p>
                  <p>The group name must be globally unique.</p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  className="mb-24"
                >
                  <MainInput
                    minLength={1}
                    maxLength={10}
                    type="text"
                    value={roomName}
                    onChange={(e) => {
                      setRoomName(e.target.value);
                      setIsRoomNameValid(
                        !allGroups?.some(
                          (group) => group.name === e.target.value,
                        ),
                      );
                    }}
                    placeholder="Enter room name"
                    style={{ borderColor: isRoomNameValid ? '' : 'red' }}
                  />
                  <MainSelect
                    value={groupNature}
                    onChange={(e) => {
                      setGroupNature(e.target.value);
                      setPassword('');
                    }}
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private</option>
                    <option value="PROTECTED">Protected</option>
                  </MainSelect>
                </div>
                {groupNature === 'PROTECTED' && (
                  <MainInput
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="mb-16"
                  />
                )}
                <MainButton
                  onClick={async () => {
                    if (!roomName) {
                      launchFlashMessage(
                        `Room name cannot be empty. Please choose a name.`,
                        FlashMessageLevel.ERROR,
                      );
                      return;
                    }
                    const newGroup: Group = {
                      id:
                        Math.random().toString(36).substring(2, 15) +
                        Math.random().toString(36).substring(2, 15),
                      name: roomName,
                      type: groupNature,
                    };
                    if ((await handleJoinRoom(newGroup, password)) === 0) {
                      updateUserSidebar();
                    }
                    // Reset inputs
                    setRoomName('');
                    setGroupNature('PUBLIC');
                    setPassword('');
                  }}
                  disabled={!isRoomNameValid}
                >
                  Join Channel
                </MainButton>
                <p>Or join an existing one</p>
                <List>
                  {allGroups &&
                    allGroups
                      .filter(
                        (group) =>
                          userGroups &&
                          !userGroups.some(
                            (userGroup) => userGroup.name === group.name,
                          ),
                      )
                      .filter(
                        (group) =>
                          group.type === 'PUBLIC' || group.type === 'PROTECTED',
                      )
                      .map((group) => (
                        <ListItem
                          key={group.name}
                          onClick={() => {
                            if (group.type === 'PROTECTED') {
                              setPopupVisible(false);
                              // Open password input popup
                              setPasswordPopupVisible(true);
                              setSelectedProtectedGroup(group);
                            } else {
                              handleJoinRoom(group, ''); // no password
                              updateUserSidebar();
                              handleGroupClick(group);
                              setPopupVisible(false);
                            }
                          }}
                        >
                          {group.name}
                          {group.type === 'PROTECTED' && ' 🔒'}
                        </ListItem>
                      ))}
                </List>
              </>
            )}
          </Modal>
        )}
        {isPasswordPopupVisible && (
          <Modal dismissModalAction={() => setPasswordPopupVisible(false)}>
            <h2>Enter Password</h2>
            <form
              onSubmit={(e) => {
                console.log('is form submitting?');
                console.log('selectedGroup: ', selectedProtectedGroup);
                e.preventDefault();
                if (selectedProtectedGroup) {
                  console.log('entra aqui');
                  handleJoinRoom(selectedProtectedGroup, password);
                }
                setPassword('');
                setPasswordPopupVisible(false);
              }}
            >
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <button
                type="submit"
                onClick={() => console.log('Button clicked')}
              >
                Join
              </button>
            </form>
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
          <List>
            {userGroups &&
              userGroups
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((group) => (
                  <ListItem
                    key={group.name}
                    onClick={() => handleGroupClick(group)}
                  >
                    {group.name}
                    {group.type === 'PROTECTED' && <span> 🔐</span>}
                    {group.type === 'PRIVATE' && <span> 🔒</span>}
                  </ListItem>
                ))}
          </List>
        </UserList>
      </GradientBorder>
    </SidebarContainer>
  );
};

export default Sidebar;
