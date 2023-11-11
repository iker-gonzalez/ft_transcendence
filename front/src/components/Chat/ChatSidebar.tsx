import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Group from '../../interfaces/chat-group.interface';
import User from '../../interfaces/chat-user.interface';
import Modal from '../UI/Modal';
import { useUserFriends } from '../../context/UserDataContext';
import GradientBorder from '../UI/GradientBorder';
import { darkerBgColor } from '../../constants/color-tokens';
import MainButton from '../UI/MainButton';
import RoundImg from '../UI/RoundImage';
import UserStatusInfo from '../UI/UserStatus';



const SidebarContainer = styled.div`
  flex-basis: 30%;
  display: flex;

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
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    color: yellow;
  }
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
  groups: Array<{ id: string; name: string }>;
  handleUserClick: (user: User) => void;
  handleGroupClick: (group: Group) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  users,
  groups,
  handleUserClick,
  handleGroupClick,
}) => {
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [activeModalContent, setActiveModalContent] = useState<'directMessages' | 'groupChats'>('directMessages');


  const { userFriends, fetchFriendsList } =
  useUserFriends();

  useEffect(() => {
    fetchFriendsList();
  }, []);

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
                  userFriendsConverted.map((friend, index) => (
                    <li key={friend.id} className="user-item" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                      <RoundImgStyled
                        src={friend.avatar}
                        alt=""
                      />
                      <UserInfo>
                        <Username className="title-2 mb-8">
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
                    </li>
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
                {/* ... */}
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
            {groups.map((group) => (
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
