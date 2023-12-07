import React, { useState } from 'react';
import User from '../../interfaces/chat-user.interface';
import Group from '../../interfaces/chat-group.interface';
import styled from 'styled-components';
import { primaryColor } from '../../constants/color-tokens';
import ChatSidebarUpdate, {
  CHAT_SIDEBAR_UPDATE,
} from '../../interfaces/chat-sidebar-update.interface';

type ChatSidebarConvoListProps = {
  users: User[];
  handleUserClick: (user: User) => void;
  updateUserSidebar: () => void;
  wasSectionUpdated: ChatSidebarUpdate;
  setWasSectionUpdated: React.Dispatch<React.SetStateAction<ChatSidebarUpdate>>;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
  setSelectedGroup: React.Dispatch<React.SetStateAction<Group | null>>;
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

  .blocked-icon {
    font-size: 0.8rem;
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
  wasSectionUpdated,
  setWasSectionUpdated,
  setSelectedUser,
  setSelectedGroup,
}): JSX.Element => {
  const [selectedItem, setSelectedItem] = useState<number>(-1);
  return (
    <>
      {users.map((user, index) => (
        <UserItemButton
          key={user.intraId}
          onClick={() => {
            setSelectedUser(user);
            setSelectedGroup(null);
            handleUserClick(user);
            updateUserSidebar();
            setSelectedItem(index);
            setWasSectionUpdated(CHAT_SIDEBAR_UPDATE.CHAT as ChatSidebarUpdate);
          }}
          className={
            selectedItem === index &&
            wasSectionUpdated === CHAT_SIDEBAR_UPDATE.CHAT
              ? 'selected'
              : ''
          }
        >
          <img src={user.avatar} alt="" className="avatar" />
          {user.username}{' '}
          {user.isBlocked && <span className="blocked-icon">🚫</span>}
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
