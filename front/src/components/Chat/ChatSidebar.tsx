import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Group from '../../interfaces/chat-group.interface';
import User from '../../interfaces/chat-user.interface';
import Modal from '../UI/Modal';
import { useUserFriends, useUserData } from '../../context/UserDataContext';
import GradientBorder from '../UI/GradientBorder';
import { darkerBgColor } from '../../constants/color-tokens';
import MainButton from '../UI/MainButton';
import RoundImg from '../UI/RoundImage';
import UserStatusInfo from '../UI/UserStatus';
import { Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import { useFlashMessages } from '../../context/FlashMessagesContext';

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

const PlusSign = styled.span`
  font-size: 28px;
  color: yellow;
  cursor: pointer;
  margin-left: 10px;
  position: relative;
  top: -8px;
`;

const Title = styled.h2`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;

  ${(props) =>
    props.className === 'friends-modal' &&
    `
    font-size: 25px;
  `}
`;

const List = styled.ul`
  list-style: none;
`;

const ListItem = styled.li`
  padding: 8px 0;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  marginbottom: '20px';
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

const MainButtonStyled = styled(MainButton)`
  padding: 5px 10px;
  font-size: 0.8em;
  margin-left: 20px;
`;

const UnreadMessagesCount = styled.span`
  display: inline-block;
  color: black;
  background-color: yellow;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  text-align: center;
  line-height: 20px;
  margin-left: 10px;
`;

interface SidebarProps {
  selectedUser: User | null;
  selectedGroup: Group | null;
  users: Array<{ intraId: number; avatar: string; username: string }>;
  userGroups: Group[] | null;
  updateUserSidebar: () => void;
  allGroups: Group[] | null;
  handleUserClick: (user: User) => void;
  handleGroupClick: (group: Group) => void;
  unreadMessages: { [key: string]: number };
  socket: Socket | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  users,
  userGroups,
  updateUserSidebar,
  allGroups,
  handleUserClick,
  handleGroupClick,
  unreadMessages,
  selectedUser,
  selectedGroup,
  socket,
}) => {
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [activeModalContent, setActiveModalContent] = useState<
    'directMessages' | 'groupChats'
  >('directMessages');
  const [roomName, setRoomName] = useState('');
  const { userFriends, fetchFriendsList } = useUserFriends();
  const { userData, fetchUserData } = useUserData();
  const { launchFlashMessage } = useFlashMessages();
  const [groupNature, setGroupNature] = useState('PUBLIC');
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchFriendsList();
    const token = Cookies.get('token');
    fetchUserData(token as string);
  }, []);

  const handleJoinRoom = (newGroup: Group, password: string) => {
    if (newGroup.name.trim() !== '' && newGroup.name && socket) {
      if (
        userGroups &&
        userGroups.some((group) => group.name === newGroup.name)
      ) {
        launchFlashMessage(
          `The group name ${newGroup.name} already exists. Please choose a different name.`,
          FlashMessageLevel.ERROR,
        );
        return 1;
      } else {
        const payload = {
          roomName: newGroup.name,
          intraId: userData?.intraId,
          type: newGroup.type,
          password: password,
        };
        socket.emit('joinRoom', payload);
        setPopupVisible(false);
        launchFlashMessage(
          `You have successfully joined the room ${newGroup.name}!`,
          FlashMessageLevel.SUCCESS,
        );
        return 0;
      }
    }
  };

  const userFriendsConverted = userFriends.map((friend) => ({
    intraId: friend.intraId,
    avatar: friend.avatar,
    username: friend.username,
  }));

  console.log('allGroups', allGroups);

  return (
    <SidebarContainer>
      <GradientBorder className="gradient-border">
        <UserList>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <Title>Direct Messages</Title>
            <PlusSign
              onClick={() => {
                setPopupVisible(true);
                setActiveModalContent('directMessages');
              }}
            >
              +
            </PlusSign>
          </div>
          <List>
            {users.map((user) => (
              <ListItem
                key={user.intraId}
                onClick= {() => {
                  handleUserClick(user);
                  updateUserSidebar();
                }}
              >
                {user.username}
                {selectedUser?.intraId !== user.intraId &&
                  unreadMessages[user.intraId] > 0 && (
                    <UnreadMessagesCount>
                      {unreadMessages[user.intraId]}
                    </UnreadMessagesCount>
                  )}
              </ListItem>
            ))}
          </List>
        </UserList>
        {isPopupVisible && (
          <Modal dismissModalAction={() => setPopupVisible(false)}>
            {activeModalContent === 'directMessages' ? (
              <>
                <Title className="friends-modal">
                  Chat with one of your friends
                </Title>
                <br></br>
                <List>
                  {userFriendsConverted.length > 0 ? (
                    userFriendsConverted.map((friend) => (
                      <ListItem
                        key={friend.intraId}
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        <RoundImgStyled src={friend.avatar} alt="" />
                        <UserInfo>
                          <Username>{friend.username}</Username>
                        </UserInfo>
                        <UserStatusInfo intraId={friend.intraId} />
                        <MainButtonStyled
                          onClick={() => {
                            handleUserClick(friend);
                            setPopupVisible(false);
                          }}
                        >
                          Chat
                        </MainButtonStyled>
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
                <Title>Create a new channel</Title>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => {
                    if (e.target.value.length <= 10) {
                      setRoomName(e.target.value);
                    }
                  }}
                  placeholder="Enter room name"
                />
                <select
                  value={groupNature}
                  onChange={(e) => setGroupNature(e.target.value)}
                >
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                  <option value="PROTECTED">Protected</option>
                </select>

                {groupNature === 'PROTECTED' && (
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                )}

                <MainButton
                  onClick={() => {
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
                    if (handleJoinRoom(newGroup, password) === 0) {
                      updateUserSidebar();
                    }
                    setRoomName('');
                  }}
                >
                  Join Channel
                </MainButton>
                <Title>Or join an existing one</Title>
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
                            handleJoinRoom(group, ''); // no password
                            handleGroupClick(group);
                            setPopupVisible(false);
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
        <UserList>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <Title>Channels</Title>
            <PlusSign
              onClick={() => {
                setPopupVisible(true);
                setActiveModalContent('groupChats');
              }}
            >
              +
            </PlusSign>
          </div>
          <List>
            {userGroups &&
              userGroups.map((group) => (
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
