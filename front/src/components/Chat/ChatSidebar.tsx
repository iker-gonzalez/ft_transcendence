import React, { useState } from 'react';
import styled from 'styled-components';
import Group from '../../interfaces/chat-group.interface';
import User from '../../interfaces/chat-user.interface';
import Modal from '../UI/Modal';
import { useUserFriends } from '../../context/UserDataContext';
import GradientBorder from '../UI/GradientBorder';
import { darkerBgColor } from '../../constants/color-tokens';

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
  top: -5px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const List = styled.ul`
  list-style: none;
`;

const ListItem = styled.li`
  padding: 8px 0;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    color: #888802;
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
      </GradientBorder>
    </SidebarContainer>
  );
};

export default Sidebar;
