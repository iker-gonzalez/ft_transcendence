import React, { useState } from 'react';
import User from '../../interfaces/chat-user.interface';
import styled from 'styled-components';
import { primaryColor, primaryLightColor } from '../../constants/color-tokens';

type ChatSidebarConvoListProps = {
  users: User[];
  handleUserClick: (user: User) => void;
  updateUserSidebar: () => void;
};

const UserItemButton = styled.button`
  color: inherit;
  font-size: inherit;

  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;

  position: relative;

  &.selected {
    &:before {
      content: '';
      width: 7px;
      height: 7px;
      background-color: ${primaryColor};
      border-radius: 50%;

      position: absolute;
      left: -7px;
      top: 50%;
      transform: translateY(-50%);
    }
  }

  .avatar {
    width: 25px;
    height: 25px;
    border-radius: 4px;
  }
`;

// const UnreadMessagesCount = styled.span`
//   display: inline-block;
//   color: black;
//   background-color: yellow;
//   border-radius: 50%;
//   width: 20px;
//   height: 20px;
//   text-align: center;
//   line-height: 20px;
//   margin-left: 10px;
// `;

const ChatSidebarConvoList: React.FC<ChatSidebarConvoListProps> = ({
  users,
  handleUserClick,
  updateUserSidebar,
}): JSX.Element => {
  const [selectedItem, setSelectedItem] = useState<number>(-1);
  return (
    <>
      {users.map((user, index) => (
        <UserItemButton
          key={user.intraId}
          onClick={() => {
            handleUserClick(user);
            updateUserSidebar();
            setSelectedItem(index);
          }}
          className={selectedItem === index ? 'selected' : ''}
        >
          <img src={user.avatar} alt="" className="avatar" />
          {user.username} {user.isBlocked && '🚫'}
          {/* TODO check what this is for */}
          {/* {selectedUser?.intraId !== user.intraId &&
            unreadMessages[user.intraId] > 0 && (
              <UnreadMessagesCount>
                {unreadMessages[user.intraId]}
              </UnreadMessagesCount>
            )} */}
        </UserItemButton>
      ))}
    </>
  );
};

export default ChatSidebarConvoList;
