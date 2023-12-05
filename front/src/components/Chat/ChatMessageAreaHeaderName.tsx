import React from 'react';
import User from '../../interfaces/chat-user.interface';
import { ChannelData } from '../../interfaces/chat-channel-data.interface';

type ChatMessageAreaHeaderNameProps = {
  user: User | null | undefined;
  channelData: ChannelData | null;
};

const ChatMessageAreaHeaderName: React.FC<ChatMessageAreaHeaderNameProps> = ({
  user,
  channelData,
}) => {
  if (user) {
    return (
      <div className="user-info-container">
        <img src={user.avatar} alt={user.username} className="avatar" />
        <p className="title-2">
          {user.username}
          {user.isBlocked && <span>🚫</span>}
        </p>
      </div>
    );
  }

  if (channelData) {
    return (
      <div className="user-info-container">
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
      </div>
    );
  }

  return <></>;
};

export default ChatMessageAreaHeaderName;
