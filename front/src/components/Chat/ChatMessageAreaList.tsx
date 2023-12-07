import React, { useEffect } from 'react';
import styled from 'styled-components';
import DirectMessage from '../../interfaces/chat-message.interface';
import ChatMessageItem from './ChatMessageItem';
import User from '../../interfaces/chat-user.interface';
import Group from '../../interfaces/chat-group.interface';
import moment from 'moment';
import { fetchAuthorized, getBaseUrl } from '../../utils/utils';

type ChatMessageAreaListProps = {
  messages: DirectMessage[];
  selectedUser: User | null;
  selectedGroup: Group | null;
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
}): JSX.Element => {
  const [mutedUsers, setMutedUsers] = React.useState<{ username: string }[]>(
    [],
  );

  useEffect(() => {
    if (selectedGroup) {
      fetchAuthorized(`${getBaseUrl()}/chat/${selectedGroup.id}/mutedUsers`)
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          setMutedUsers(data.data);
        });
    }
  }, [messages, selectedGroup]);

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
        messages
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
          })
      )}
    </MessageList>
  );
};

export default ChatMessageAreaList;
