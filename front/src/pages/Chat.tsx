import React, { useState } from 'react';
import ChatSidebar from '../components/Chat/ChatSidebar';

// Define an interface for dummyMessages
interface Message {
    sender: string;
    text: string;
  }
  
  interface MessageData {
    [key: number]: Message[];
  }

// Dummy data for users and messages
const dummyUsers = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Alice Smith' },
  // Add more users here
];

const dummyGroups = [
  { id: 101, name: 'Group 1' },
  { id: 102, name: 'Group 2' },
  // Add more groups here
];

const dummyMessages: MessageData = {
    1: [
      { sender: 'John Doe', text: 'Hello, how are you?' },
      { sender: 'User', text: "I'm doing great, thanks!" },
      // Add more messages for user 1
    ],
    2: [
      { sender: 'Alice Smith', text: 'Hi there!' },
      { sender: 'User', text: "Hello! What's up?" },
      // Add more messages for user 2
    ],
    101: [
      { sender: 'Group 1', text: 'Welcome to our group!' },
      { sender: 'User', text: 'Thank you! Glad to be here.' },
      // Add more messages for group 1
    ],
    102: [
      { sender: 'Group 2', text: 'Group 2 chat' },
      { sender: 'User', text: 'Another message in group 2.' },
      // Add more messages for group 2
    ],
    // Add more message arrays here
  };
  

const ChatPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);

  const handleUserClick = (userId: number) => {
    setSelectedUser(userId);
    setSelectedGroup(null);
  };

  const handleGroupClick = (groupId: number) => {
    setSelectedUser(null);
    setSelectedGroup(groupId);
  };

  return (
    <div className="chat-page">
      <ChatSidebar
        users={dummyUsers}
        groups={dummyGroups}
        handleUserClick={handleUserClick}
        handleGroupClick={handleGroupClick}
      />

      <div className="message-area">
        {selectedUser !== null && (
          <div className="conversation">
            <h2>Chat with User {selectedUser}</h2>
            <div className="message-list">
              {dummyMessages[selectedUser].map((message, index) => (
                <div key={index} className="message">
                  {message.text}
                </div>
              ))}
            </div>
            {/* Add an input field and send button here for sending messages */}
          </div>
          
        )}

        {selectedGroup !== null && (
          <div className="conversation">
            <h2>Group Chat {selectedGroup}</h2>
            <div className="message-list">
              {dummyMessages[selectedGroup].map((message, index) => (
                <div key={index} className="message">
                  {message.text}
                </div>
              ))}
            </div>
            {/* Add an input field and send button here for sending messages */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
