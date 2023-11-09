import React, { useState, useEffect } from 'react';
import ChatSidebar from '../components/Chat/ChatSidebar';
import ChatMessageArea from '../components/Chat/ChatMessageArea';
import Group from '../interfaces/chat-group.interface';
import User from '../interfaces/chat-user.interface';
import Message from '../interfaces/chat-message.interface';
import { fetchAuthorized, getBaseUrl } from '../utils/utils';
import { useUserData } from '../context/UserDataContext';
import Cookies from 'js-cookie';
import { getIntraId } from '../utils/utils';
  
/**
 * ChatPage component that displays the chat sidebar and message area.
 * @returns React functional component.
 */
const ChatPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null); 
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [messages, setMessages] = useState<Message[]>([]); 
  
  const { userData } = useUserData();

  useEffect(() => {
    // Fetch all users that the signed in user has chatted with privately
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
    
    // Fetch all groups that the signed in user has chatted in
    fetchAuthorized(`${getBaseUrl()}/chat/${userData?.intraId}/CM`, {
      headers: {
        Authorization: `Bearer ${Cookies.get('token')}`,
      },
    })
    .then(response => response.json())
    .then((data: Group[]) => {
    
    const groups = data.map(item => {
      return {
        id: item.id,
        name: item.name
      }
    });
      setGroups(groups);
    })
  }
  }, [userData])


  /**
   * Handles the click event on a user in the chat sidebar.
   * Fetches the messages between the signed in user and the selected user.
   * @param user - The selected user.
   */
  const handleUserClick = (user: User) => {
    const userIntraId = getIntraId(user.username); //temporary until endpoint is fixed
    fetchAuthorized(`${getBaseUrl()}/chat/${userData?.intraId}/${userIntraId}/DM`, /* temporary until endpoint is fixed */{
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

  /**
   * Handles the click event on a group in the chat sidebar.
   * Sets the selected group and clears the selected user.
   * @param group - The selected group.
   */
  const handleGroupClick = (group: Group) => {
    setSelectedUser(null);
    setSelectedGroup(group);
  };

  return (
    <div className="chat-page">
      <ChatSidebar
        users={users}
        groups={groups}
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
