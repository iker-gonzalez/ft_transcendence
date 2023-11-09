import React, { useState, useEffect } from 'react';
import ChatSidebar from '../components/Chat/ChatSidebar';
import ChatMessageArea from '../components/Chat/ChatMessageArea';
import Group from '../interfaces/chat-group.interface';
import User from '../interfaces/chat-user.interface';
import Message from '../interfaces/chat-message.interface';
import { fetchAuthorized, getBaseUrl } from '../utils/utils';
import { useUserData } from '../context/UserDataContext';
import Cookies from 'js-cookie';

const dummyGroups = [
  { id: 101, name: 'NAUTILUS' },
  { id: 102, name: 'MAGRATHEA' },
  // Add more groups here
];
  
  const ChatPage: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null); 
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [messages, setMessages] = useState<Message[]>([]); 
    
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
    fetchAuthorized(`${getBaseUrl()}/chat/${userData?.intraId}/668/DM`, /*TODO: change 667 to user.intraid */{
      headers: {
        Authorization: `Bearer ${Cookies.get('token')}`,
      },
    })
    .then(response => response.json())
    .then((data: Message[]) => {
      const messages = data.map((item: Message) => {
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
      setMessages(messages);
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
        messages={messages} //here should be messages with the most recent one
      />
    </div>
  );
};

export default ChatPage;
