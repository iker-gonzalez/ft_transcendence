import React from 'react';
import User from '../../interfaces/chat-user.interface';
import { ChannelData } from '../../interfaces/chat-channel-data.interface';
import styled from 'styled-components';

type ChatMessageAreaHeaderNameProps = {
  user: User | null | undefined;
  channelData: ChannelData | null;
  setShowFriendProfile: React.Dispatch<React.SetStateAction<boolean>>;
};

const WrapperDiv = styled.div`
  white-space: nowrap;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  .avatar-button {
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 4px;
    }
  }
`;

const ChatMessageAreaHeaderName: React.FC<ChatMessageAreaHeaderNameProps> = ({
  user,
  channelData,
  setShowFriendProfile,
}) => {
  if (user) {
    return (
      <WrapperDiv>
        <button
          disabled={user.isBlocked}
          onClick={() => setShowFriendProfile(true)}
          className="avatar-button"
        >
          <img src={user.avatar} alt={user.username} className="avatar" />
        </button>
        <p className="title-2">
          {user.username}
          {user.isBlocked && <span>🚫</span>}
        </p>
      </WrapperDiv>
    );
  }

  if (channelData) {
    return (
      <WrapperDiv>
        <p className="title-2">
          {(() => {
            switch (channelData.type) {
              case 'PUBLIC':
                return '🌐';
              case 'PROTECTED':
                return '🔐';
              case 'PRIVATE':
                return '🔒';
              default:
                return null;
            }
          })()}{' '}
          {channelData.roomName}
        </p>
      </WrapperDiv>
    );
  }

  return <></>;
};

export default ChatMessageAreaHeaderName;
