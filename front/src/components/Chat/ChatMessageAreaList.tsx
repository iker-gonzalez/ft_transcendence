import React from 'react';
import styled from 'styled-components';
import DirectMessage from '../../interfaces/chat-message.interface';
import ChatMessageItem from './ChatMessageItem';

type ChatMessageAreaListProps = {
  messages: DirectMessage[];
};

const MessageList = styled.ul`
  list-style: none;
  padding: 0;
`;

const EmpyStateDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  height: 100%;
`;

const ChatMessageAreaList: React.FC<ChatMessageAreaListProps> = ({
  messages,
}): JSX.Element => {
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
