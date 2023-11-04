import React from 'react';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  width: 25%;
  background-color: black;
  color: white;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  border: 2px solid yellow;
  position: absolute;
  top: 100px; /* Adjust the offset as needed */
`;

const UserList = styled.div`
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const List = styled.ul`
  list-style: none;
`;

const ListItem = styled.li`
  padding: 8px 0;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e0e0e0;
  }
`;

interface SidebarProps {
  users: Array<{ id: number; name: string }>;
  groups: Array<{ id: number; name: string }>;
  handleUserClick: (userId: number) => void;
  handleGroupClick: (groupId: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ users, groups, handleUserClick, handleGroupClick }) => {
  return (
    <SidebarContainer>
      <UserList>
        <Title>Direct Messages</Title>
        <List>
          {users.map((user) => (
            <li key={user.id} onClick={() => handleUserClick(user.id)}>
              {user.name}
            </li>
          ))}
        </List>
        <Title>Group Chats</Title>
        <List>
          {groups.map((group) => (
            <li key={group.id} onClick={() => handleGroupClick(group.id)}>
              {group.name}
            </li>
          ))}
        </List>
        </UserList>
    </SidebarContainer>
  );
};

export default Sidebar;
