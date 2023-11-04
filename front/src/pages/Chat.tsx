import React, { useState } from 'react';
import ChatSidebar from '../components/Chat/ChatSidebar';
import ChatMessageArea from '../components/Chat/ChatMessageArea';
import Group from '../interfaces/chat-group.interface';
import User from '../interfaces/chat-user.interface';

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
  { id: 101, name: 'NAUTILUS' },
  { id: 102, name: 'MAGRATHEA' },
  // Add more groups here
];

const dummyMessages: MessageData = {
    1: [
      { sender: 'John Doe', text: 'Hello, how are you?' },
      { sender: 'Sam Smith', text: "I'm doing great, thanks!" },
      // Add more messages for user 1
    ],
    2: [
      { sender: 'Alice Smith', text: 'Hi there!' },
      { sender: 'David Becham', text: "Hello! What's up?" },
      // Add more messages for user 2
    ],
    101: [
      { sender: 'Pepe Rabales', text: 'Welcome to our group!' },
      { sender: 'Paco Turio', text: 'Thank you! Glad to be here.' },
      // Add more messages for group 1
    ],
    102: [
      { sender: 'Julio Mandiba', text: 'Hello, nice to meet you all!' },
      { sender: 'Roberta Del Piero', text: 'Hi, my name is Roberta (:' },
      // Add more messages for group 2
    ],
    // Add more message arrays here
  };
  

const ChatPage: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null); 
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const handleUserClick = (user: User) => {
    setSelectedUser(user); 
    setSelectedGroup(null);
  };
  
  const handleGroupClick = (group: Group) => {
    setSelectedUser(null);
    setSelectedGroup(group);
  };

  return (
    <div className="chat-page">
      <ChatSidebar
        users={dummyUsers}
        groups={dummyGroups}
        handleUserClick={handleUserClick}
        handleGroupClick={handleGroupClick}
      />

      <ChatMessageArea
        selectedUser={selectedUser}
        selectedGroup={selectedGroup}
        messages={dummyMessages}
      />
    </div>
  );
};

export default ChatPage;
