import React, { useState, useEffect } from 'react';
import ChatSidebar from '../components/Chat/ChatSidebar';
import ChatMessageArea from '../components/Chat/ChatMessageArea';
import Group from '../interfaces/chat-group.interface';
import User from '../interfaces/chat-user.interface';
import Message from '../interfaces/chat-message.interface';
import { fetchAuthorized, getBaseUrl } from '../utils/utils';
import { useUserData } from '../context/UserDataContext';
import Cookies from 'js-cookie';
import { timeStamp } from 'console';
  
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

const dummyMessages: Message[] = [
  {
    id: "1",
    senderName: 'John Doe',
    senderAvatar: 'https://i.pravatar.cc/600?img=1', 
    content: 'Hi there!',
    timestamp: "2023-11-08T09:00:00Z"
  },
  {
    id: "2",
    senderName: 'Jane Smith',
    senderAvatar: 'https://i.pravatar.cc/600?img=2',
    content: 'Hello to you too!',
    timestamp: "2023-11-08T09:01:00Z"
  },
  {
    id: "3", 
    senderName: 'John Doe',
    senderAvatar: 'https://i.pravatar.cc/600?img=1',
    content: 'How are you today?',
    timestamp: "2023-11-08T09:02:00Z"
  },
  {
    id: "4",
    senderName: 'Jane Smith', 
    senderAvatar: 'https://i.pravatar.cc/600?img=2',
    content: 'I am doing great, thanks!',
    timestamp: "2023-11-08T09:03:00Z"
  }
];

  
  const ChatPage: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null); 
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [users, setUsers] = useState<User[]>([]); 
    
    const { userData } = useUserData();
    console.log('userdataa:', userData);
    useEffect(() => {
      // Fetch username and update the state
      if (userData) {
        fetchAuthorized(`${getBaseUrl()}/chat/${userData?.intraId}/DM`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      })
      .then(response => response.json())
      .then((data: User[]) => {
      
      const users = data.map(item => {
        return {
          id: item.id,
          avatar: item.avatar,
          username: item.username
        }
      });
      
        setUsers(users);

      });
      }
    }, [userData]);

  console.log('users:', users);
  const handleUserClick = (user: User) => {

    fetchAuthorized(`${getBaseUrl()}/chat/${userData?.intraId}/${user.id}`, {
      headers: {
        Authorization: `Bearer ${Cookies.get('token')}`,
      },
    })
    
    .then(response => response.json())
    
    .then(response => {
  
      const messages = response.map((item: Message) => {
        return {
          id: item.id,
          senderName: item.senderName, 
          senderAvatar: item.senderAvatar,
          content: item.content,
          timestamp: item.timestamp  
        }
      });
  
      setSelectedUser(user);
      setSelectedGroup(null);
  
      return (
        <ChatMessageArea 
          selectedUser={user}
          selectedGroup={selectedGroup}
          messages={messages}  
        />
      )
  
    })
  
  }

  const handleGroupClick = (group: Group) => {
    setSelectedUser(null);
    setSelectedGroup(group);
  };

  return (
    <div className="chat-page">
      <ChatSidebar
        users={users}
        groups={dummyGroups}
        handleUserClick={handleUserClick}
        handleGroupClick={handleGroupClick}
      />

      <ChatMessageArea
        selectedUser={selectedUser}
        selectedGroup={selectedGroup}
        messages={dummyMessages} //here should be messages with the most recent one
      />
    </div>
  );
};

export default ChatPage;
