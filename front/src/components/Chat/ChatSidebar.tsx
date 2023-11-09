import React, { useState } from 'react';
import styled from 'styled-components';
import Group from '../../interfaces/chat-group.interface';
import User from '../../interfaces/chat-user.interface';
import Modal from '../UI/Modal';
import { useUserFriends } from '../../context/UserDataContext';

const SidebarContainer = styled.div`
  width: calc(25% - 10px); /* Subtract 10px for margin/padding */
  background-color: black;
  color: white;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  border: 2px solid yellow;
  position: absolute;
  top: 100px; /* Adjust the offset as needed */
  left: 0; /* Position on the left */
  bottom: 0; /* Occupy the full height */
  overflow-y: auto; /* Add scroll behavior when content overflows */
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
  top: -5px;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const List = styled.ul`
  list-style: none;
`;

const ListItem = styled.li`
  padding: 8px 0;
  font-size: 20px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #888802;
  }
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
  const { userFriends } = useUserFriends();
  const userFriendsConverted = userFriends.map((friend) => ({
    id: friend.intraId,
    avatar: friend.avatar,
    username: friend.username,
  }));
  console.log('friends:', userFriends);
  return (
    <SidebarContainer>
      <UserList>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <Title>Direct Messages</Title>
          <PlusSign onClick={() => setPopupVisible(true)}>+</PlusSign>
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
          <Title>Chat with one of your friends</Title>
          <List>
            {userFriendsConverted.map((friend, index) => (
              <ListItem
                key={index}
                onClick={() => {
                  handleUserClick(friend);
                  setPopupVisible(false);
                }}
              >
                {friend.username}
              </ListItem>
            ))}
          </List>
        </Modal>
      )}
      <UserList>
        <Title>Group Chats</Title>
        <List>
          {groups.map((group) => (
            <ListItem key={group.id} onClick={() => handleGroupClick(group)}>
              {group.name}
            </ListItem>
          ))}
        </List>
      </UserList>
    </SidebarContainer>
  );
};

export default Sidebar;
