import React, { useState } from 'react';
import styled from 'styled-components';
import {
  darkBgColor,
  darkestBgColor,
  primaryColor,
} from '../../constants/color-tokens';
import User from '../../interfaces/chat-user.interface';
import Group from '../../interfaces/chat-group.interface';
import { CHANNEL_TYPES } from '../../constants/shared';
import ChatSidebarUpdate, {
  CHAT_SIDEBAR_UPDATE,
} from '../../interfaces/chat-sidebar-update.interface';

type ChatSidebarConvoListProps = {
  userGroups: Group[];
  handleGroupClick: (group: Group) => void;
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
    width: 22px;
    height: 22px;
    border: 1px ${darkBgColor} solid;
    border-radius: 4px;

    background-color: ${darkestBgColor};

    font-size: 12px;
    line-height: 1;

    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

const ChatSidebarChannelList: React.FC<ChatSidebarConvoListProps> = ({
  userGroups,
  handleGroupClick,
  wasSectionUpdated,
  setWasSectionUpdated,
  setSelectedUser,
  setSelectedGroup
}): JSX.Element => {
  const [selectedItem, setSelectedItem] = useState<number>(-1);

  return (
    <>
      {userGroups
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((group, index) => (
          <UserItemButton
            key={group.name}
            onClick={() => {
              setSelectedGroup(group);
              setSelectedUser(null);
              handleGroupClick(group);
              setSelectedItem(index);
              setWasSectionUpdated(
                CHAT_SIDEBAR_UPDATE.CHANNELS as ChatSidebarUpdate,
              );
            }}
            className={
              selectedItem === index &&
              wasSectionUpdated === CHAT_SIDEBAR_UPDATE.CHANNELS
                ? 'selected'
                : ''
            }
          >
            <div className="avatar">
              <span>
                {(() => {
                  switch (group.type) {
                    case CHANNEL_TYPES.PROTECTED:
                      return '🔐';
                    case CHANNEL_TYPES.PRIVATE:
                      return '🔒';
                    default:
                      return '🌐';
                  }
                })()}
              </span>
            </div>
            {group.name}
          </UserItemButton>
        ))}
    </>
  );
};

export default ChatSidebarChannelList;
