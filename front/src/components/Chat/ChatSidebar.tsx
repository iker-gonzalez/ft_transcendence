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
import useChatMessageSocket, {
  UseChatMessageSocket,
} from './useChatMessageSocket';
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

  ${props => props.className === 'friends-modal' && `
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
  marginBottom: '20px';
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

interface SidebarProps {
  users: Array<{ id: number; avatar: string; username: string }>;
  userGroups: Array<{ id: string; name: string }>;
  allGroups: Array<{ id: string; name: string }>;
  handleUserClick: (user: User) => void;
  handleGroupClick: (group: Group) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  users,
  userGroups,
  allGroups,
  handleUserClick,
  handleGroupClick,
}) => {

  const [isPopupVisible, setPopupVisible] = useState(false);
  const [activeModalContent, setActiveModalContent] = useState<'directMessages' | 'groupChats'>('directMessages');
  const [roomName, setRoomName] = useState('');
  const { userFriends, fetchFriendsList } =
  useUserFriends();
  const { userData, fetchUserData } =
  useUserData();
  const { launchFlashMessage } = useFlashMessages();

  useEffect(() => {
    fetchFriendsList();
    const token = Cookies.get('token');
    fetchUserData(token as string);
  }, []);
  
  // Get the socket and related objects from the utility function
  const {
    chatMessageSocketRef,
    isSocketConnected,
    isConnectionError,
  }: UseChatMessageSocket = useChatMessageSocket();

  // Add a listener for incoming messages
  useEffect(() => {
    if (isSocketConnected) {
      chatMessageSocketRef.current.on('newMessage', (messageData: string) => {
        // Handle the incoming message, e.g., add it to your message list
        console.log('Received a new message:', messageData);

        // You can update your message state or perform other actions here
      });
    }
  }, [isSocketConnected, chatMessageSocketRef]);

  const handleJoinRoom = (roomName: string) => {
    if (roomName.trim() !== '') {
      chatMessageSocketRef.current.emit('joinRoom', { roomName, intraId: userData?.intraId });
      setPopupVisible(false);
      launchFlashMessage(
        `You have successfully joined the room ${roomName}!`,
        FlashMessageLevel.SUCCESS,
      );

    }
  };

  const userFriendsConverted = userFriends.map((friend) => ({
    id: friend.intraId,
    avatar: friend.avatar,
    username: friend.username,
  }));
  console.log('friends:', userFriends);
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
            <PlusSign onClick={() => { setPopupVisible(true); setActiveModalContent('directMessages'); }}>+</PlusSign>
          </div>
          <List>
            {users.map((user) => (
              <ListItem key={user.id} onClick={() => handleUserClick(user)}>
                {user.username}
              </ListItem>
            ))}
          </List>
        </UserList>
        {isPopupVisible && (
          <Modal dismissModalAction={() => setPopupVisible(false)}>
            {activeModalContent === 'directMessages' ? (
              <>
                <Title className='friends-modal'>Chat with one of your friends</Title>
                <br></br>
                <List>
                {userFriendsConverted.length > 0 ? (
                  userFriendsConverted.map((friend) => (
                    <ListItem key={friend.id} style={{ display: 'flex', alignItems: 'center' }}>
                      <RoundImgStyled
                        src={friend.avatar}
                        alt=""
                      />
                      <UserInfo>
                        <Username>
                          {friend.username}
                        </Username>
                      </UserInfo>
                      <UserStatusInfo intraId={friend.id} />
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
                    It seems you do not have any friends yet. 
                    Go to your profile and find some friends to chat with!
                  </p>
                )}
                </List>
              </>
            ) : (
              <>
                <Title>Create a new group chat or join an existing one</Title>
                <input 
                  type="text" 
                  value={roomName} 
                  onChange={(e) => {
                    if (e.target.value.length <= 15) {
                      setRoomName(e.target.value);
                    }
                  }}  
                  placeholder="Enter room name"
                />
                <MainButton onClick={() => {
                  handleGroupClick({
                    id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), 
                    name: roomName
                  });
                  handleJoinRoom(roomName);
                }}>
                  Join Room
                </MainButton>
                <Title>Or join an existing one</Title>
                  <List>
                    {allGroups.filter(group => !userGroups.includes(group)).map((group) => (
                      <ListItem 
                        key={group.id} 
                        onClick={() => {
                          handleGroupClick(group);
                          setPopupVisible(false);
                          handleJoinRoom(group.name);
                        }}
                      >
                        {group.name}
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
            <Title>Group Chats</Title>
            <PlusSign onClick={() => { setPopupVisible(true); setActiveModalContent('groupChats'); }}>+</PlusSign>
          </div>
          <List>
            {userGroups.map((group) => (
              <ListItem key={group.id} onClick={() => handleGroupClick(group)}>
                {group.name}
              </ListItem>
            ))}
          </List>
        </UserList>
      </GradientBorder>
    </SidebarContainer>
  );
}

export default Sidebar;
