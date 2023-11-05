import React, { useState } from 'react';
import ChatSidebar from '../components/Chat/ChatSidebar';
import ChatMessageArea from '../components/Chat/ChatMessageArea';
import Group from '../interfaces/chat-group.interface';
import User from '../interfaces/chat-user.interface';
import Message from '../interfaces/chat-message.interface';
  
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
      { sender: 'John Doe', avatar: 'https://i.pravatar.cc/600?img=8', text: 'Hello, how are you?' },
      { sender: 'Sam Smith', avatar: 'https://i.pravatar.cc/600?img=8',text: "I'm doing great, thanks!" },
      // Add more messages for user 1
    ],
    2: [
      { sender: 'Alice Smith', avatar: 'https://i.pravatar.cc/600?img=8',text: 'As they rounded a bend in the path that ran beside the river, Lara recognized the silhouette of a fig tree atop a nearby hill. The weather was hot and the days were long. The fig tree was in full leaf, but not yet bearing fruit      Soon Lara spotted other landmarks—an outcropping of limestone beside the path that had a silhouette like a man’s face, a marshy spot beside the river where the waterfowl were easily startled, a tall tree that looked like a man with his arms upraised. They were drawing near to the place where there was an island in the river. The island was a good spot to make camp. They would sleep on the island tonight.      Lara had been back and forth along the river path many times in her short life. Her people had not created the path—it had always been there, like the river—but their deerskin-shod feet and the wooden wheels of their handcarts kept the path well worn. Lara’s people were salt traders, and their livelihood took them on a continual journey.' },  
      { sender: 'David Becham', avatar: 'https://i.pravatar.cc/600?img=8',text: "Hello! What's up?" },
      // Add more messages for user 2
    ],
    101: [
      { sender: 'Pepe Rabales', avatar: 'https://i.pravatar.cc/600?img=8',text: 'Welcome to our group!' },
      { sender: 'Paco Turio', avatar: 'https://i.pravatar.cc/600?img=8',text: 'Thank you! Glad to be here.' },
      // Add more messages for group 1
    ],
    102: [
      { sender: 'Julio Mandiba', avatar: 'https://i.pravatar.cc/600?img=8',text: 'Hello, nice to meet you all!' },
      { sender: 'Roberta Del Piero', avatar: 'https://i.pravatar.cc/600?img=8',text: 'Hi, my name is Roberta (:' },
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
