import React from 'react';
import User from '../../interfaces/chat-user.interface';
import { ChannelData } from '../../interfaces/chat-channel-data.interface';
import styled from 'styled-components';

type ChatMessageAreaHeaderNameProps = {
  user: User | null | undefined;
  channelData: ChannelData | null;
};

const WrapperDiv = styled.div`
  white-space: nowrap;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 4px;
  }
`;

const ChatMessageAreaHeaderName: React.FC<ChatMessageAreaHeaderNameProps> = ({
  user,
  channelData,
}) => {
  if (user) {
    return (
      <WrapperDiv>
        <img src={user.avatar} alt={user.username} className="avatar" />
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
          {channelData.roomName}{' '}
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
          })()}
        </p>
      </WrapperDiv>
    );
  }

  return <></>;
};

export default ChatMessageAreaHeaderName;
