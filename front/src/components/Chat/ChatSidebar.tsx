import React from 'react';
import styled from 'styled-components';
import Group from '../../interfaces/chat-group.interface';
import User from '../../interfaces/chat-user.interface';
import ContrastPanel from '../UI/ContrastPanel';

const SidebarContainer = styled(ContrastPanel)`
  flex-basis: 30%;
  padding: 20px;
  border: 2px solid yellow;
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
  handleUserClick: (user: User) => void;
  handleGroupClick: (group: Group) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  users,
  groups,
  handleUserClick,
  handleGroupClick,
}) => {
  return (
    <SidebarContainer>
      <UserList>
        <Title>Direct Messages</Title>
        <List>
          {users.map((user) => (
            <li key={user.id} onClick={() => handleUserClick(user)}>
              {user.name}
            </li>
          ))}
        </List>
        <br />
        <Title>Group Chats</Title>
        <List>
          {groups.map((group) => (
            <li key={group.id} onClick={() => handleGroupClick(group)}>
              {group.name}
            </li>
          ))}
        </List>
      </UserList>
    </SidebarContainer>
  );
};

export default Sidebar;
