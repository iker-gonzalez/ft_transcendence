import React from 'react';
import styled from 'styled-components';
import DirectMessage from '../../interfaces/chat-message.interface';
import ChatMessageItem from './ChatMessageItem';
import User from '../../interfaces/chat-user.interface';
import Group from '../../interfaces/chat-group.interface';

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
  if (selectedUser?.isBlocked) {
    return (
      <EmpyStateDiv>
        <p>
          This user is blocked. You won't be able to read this conversation
          until you unblock them.
        </p>
      </EmpyStateDiv>
    );
  }

  let filteredMessages = messages;

  if (selectedUser) {
    filteredMessages = messages.filter(
      message =>
        // TODO: pending to include senderIntraId and receiverIntraId in the DM between two usersendpoint
        selectedUser.intraId === message.senderIntraId ||
        selectedUser.intraId === message.receiverIntraId
    );
  } else if (selectedGroup) {
    filteredMessages = messages.filter(
      // TODO: pending to include roomName in the channelMessage object when retrieving the messages of a channel
      message => selectedGroup.name === message.roomName
    );
  }

  if (filteredMessages.length === 0 || (!selectedUser && !selectedGroup)) {
    return (
      <EmpyStateDiv>
        <p>There are no messages to show</p>
      </EmpyStateDiv>
    );
  }

  console.log('selectedUser: ', selectedUser);
  console.log('selectedGroup: ', selectedGroup);
  console.log('filteredMessages: ', filteredMessages);

  return (
    <MessageList>
      {filteredMessages.map((message, index) => {
        return (
          <ChatMessageItem
            key={message.id}
            message={message}
            isRepeatedMessage={
              filteredMessages[index - 1]?.senderName === message.senderName
            }
          />
        );
      })}
    </MessageList>
  );
};

export default ChatMessageAreaList;
