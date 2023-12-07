import React from 'react';
import styled from 'styled-components';
import DirectMessage from '../../interfaces/chat-message.interface';
import ChatMessageItem from './ChatMessageItem';
import User from '../../interfaces/chat-user.interface';
import Group from '../../interfaces/chat-group.interface';
import moment from 'moment';
import { useUserData } from '../../context/UserDataContext';

type ChatMessageAreaListProps = {
  messages: DirectMessage[];
  selectedUser: User | null;
  selectedGroup: Group | null;
  mutedUsers: { username: string }[];
};

const MessageList = styled.ul`
  list-style: none;
  padding: 0;
`;

const EmpyStateDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  > * {
    max-width: 4in;
    text-align: center;
  }

  height: 100%;
`;

const ChatMessageAreaList: React.FC<ChatMessageAreaListProps> = ({
  messages,
  selectedUser,
  selectedGroup,
  mutedUsers,
}): JSX.Element => {
  const { userData } = useUserData();

  if (selectedUser?.isBlocked) {
    return (
      <EmpyStateDiv>
        <p>
          This conversation is blocked. To read this conversation, unblock your
          friend or wait for them to unblock you.
        </p>
      </EmpyStateDiv>
    );
  }

  return (
    <MessageList>
      {messages.length === 0 ? (
        <EmpyStateDiv>
          <p>There are no messages to show</p>
        </EmpyStateDiv>
      ) : (
        <>
          {(() => {
            if (mutedUsers?.length === 0) return;

            const isCurrentUserMuted = mutedUsers?.some(
              (mutedUser) => mutedUser.username === userData?.username,
            );
            if (isCurrentUserMuted) {
              return (
                <p className="small mb-24">
                  ℹ️ You were muted by an admin of this channel. You cannot
                  write new messages until you are unmuted.
                </p>
              );
            } else {
              return (
                <p className="small mb-24">
                  ℹ️ Some messages were hidden by the admin(s) of this channel.
                </p>
              );
            }
          })()}
          {messages
            .filter((message) => {
              if (selectedUser) {
                return (
                  selectedUser.username === message.senderName ||
                  selectedUser.username === message.receiverName
                );
              } else if (selectedGroup) {
                const isMutedUser = mutedUsers?.some(
                  (mutedUser) => message.senderName === mutedUser.username,
                );

                return selectedGroup.name === message.roomName && !isMutedUser;
              }

              return true;
            })
            .map((message, index) => {
              return (
                <div key={`${message.id}-${index}`}>
                  <ChatMessageItem
                    message={message}
                    isRepeatedMessage={(() => {
                      const previousMessage = messages[index - 1];

                      if (!previousMessage) return false;
                      if (message.createdAt) {
                        const isSameSender =
                          previousMessage.senderName === message.senderName;

                        const differenceInMinutes = moment(message.createdAt)
                          .seconds(0)
                          .diff(
                            moment(previousMessage.createdAt).seconds(0),
                            'minutes',
                          );

                        const wasSentAtSameTime = differenceInMinutes === 0;

                        return isSameSender && wasSentAtSameTime;
                      }

                      return false;
                    })()}
                  />
                </div>
              );
            })}
        </>
      )}
    </MessageList>
  );
};

export default ChatMessageAreaList;
