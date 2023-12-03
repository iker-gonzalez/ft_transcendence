import React from 'react';
import ScrollIntoViewIfNeeded from 'react-scroll-into-view-if-needed';
import styled from 'styled-components';
import { primaryAccentColor } from '../../constants/color-tokens';
import DirectMessage from '../../interfaces/chat-message.interface';

const avatarWidth = '30px';
const avatarMarginRight = '8px';

const WrapperLi = styled.li`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;

  margin-bottom: 15px;

  .avatar {
    width: ${avatarWidth};
    height: ${avatarWidth};
    border-radius: 4px;
    margin-right: ${avatarMarginRight};
  }

  .message-container {
    .message-header {
      display: flex;
      justify-content: flex-start;
      align-items: baseline;

      .username {
        font-weight: bold;
        line-height: 1;
        margin-bottom: 6px;
        margin-right: 8px;
      }

      .timestamp {
        opacity: 0.7;
        font-size: 0.8rem;
      }
    }

    .message {
      a {
        color: ${primaryAccentColor};
      }

      &.repeated {
        margin-left: ${parseInt(avatarWidth) + parseInt(avatarMarginRight)}px;
      }
    }
  }
`;

const ChatMessageItem: React.FC<{
  message: DirectMessage;
  isRepeatedMessage: boolean;
}> = ({ message, isRepeatedMessage }): JSX.Element => {
  return (
    <>
      <ScrollIntoViewIfNeeded>
        <WrapperLi key={message.id}>
          {!isRepeatedMessage && (
            <img src={message.senderAvatar} alt="" className="avatar" />
          )}

          <div className="message-container">
            {!isRepeatedMessage && (
              <div className="message-header">
                <p className="username">{message.senderName}</p>
                <p className="timestamp">
                  {new Date(
                    Date.parse(message.createdAt as string),
                  ).toLocaleString('us-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                  })}
                </p>
              </div>
            )}
            <p
              dangerouslySetInnerHTML={{
                __html: message.content,
              }}
              className={`message ${isRepeatedMessage ? 'repeated' : ''}`}
            />
          </div>
        </WrapperLi>
      </ScrollIntoViewIfNeeded>
    </>
  );
};

export default ChatMessageItem;
