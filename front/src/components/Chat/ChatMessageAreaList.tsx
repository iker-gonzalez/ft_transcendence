import React from 'react';
import styled from 'styled-components';
import DirectMessage from '../../interfaces/chat-message.interface';
import ChatMessageItem from './ChatMessageItem';
import User from '../../interfaces/chat-user.interface';
import Group from '../../interfaces/chat-group.interface';
import UserData from '../../interfaces/user-data.interface';
import moment from 'moment';

type ChatMessageAreaListProps = {
  messages: DirectMessage[];
  selectedUser: User | null;
  selectedGroup: Group | null;
  userData: UserData | null;
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
  userData,
}): JSX.Element => {
  console.log('hola buenas');
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
  console.log('messagesss', messages);
  console.log('selectedUser: ', selectedUser);
  let filteredMessages = messages;

  if (selectedUser) {
    filteredMessages = messages.filter((message) => {
      return (
        selectedUser.username === message.senderName ||
        selectedUser.username === message.receiverName
      );
    });
  } else if (selectedGroup) {
    filteredMessages = messages.filter(
      (message) => selectedGroup.name === message.roomName,
    );
  }

  if (filteredMessages.length === 0) {
    return (
      <EmpyStateDiv>
        <p>There are no messages to show</p>
      </EmpyStateDiv>
    );
  }

  return (
    <MessageList>
      {filteredMessages.map((message, index) => {
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
    </MessageList>
  );
};

export default ChatMessageAreaList;
