import React from 'react';
import styled from 'styled-components';
import DirectMessage from '../../interfaces/chat-message.interface';
import ChatMessageItem from './ChatMessageItem';
import User from '../../interfaces/chat-user.interface';

type ChatMessageAreaListProps = {
  messages: DirectMessage[];
  selectedUser: User | null;
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

  if (messages.length === 0) {
    return (
      <EmpyStateDiv>
        <p>There are no messages to show</p>
      </EmpyStateDiv>
    );
  }

  return (
    <MessageList>
      {messages.map((message, index) => {
        return (
          <ChatMessageItem
            message={message}
            isRepeatedMessage={
              messages[index - 1]?.senderName === message.senderName
            }
          />
        );
      })}
    </MessageList>
  );
};

export default ChatMessageAreaList;
