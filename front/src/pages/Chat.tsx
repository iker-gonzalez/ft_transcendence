import React, { useState, useEffect, useRef } from 'react';
import ChatSidebar from '../components/Chat/ChatSidebar';
import ChatMessageArea from '../components/Chat/ChatMessageArea';
import Group from '../interfaces/chat-group.interface';
import User from '../interfaces/chat-user.interface';
import Message from '../interfaces/chat-dm-message.interface';
import { fetchAuthorized, getBaseUrl } from '../utils/utils';
import { useUserData } from '../context/UserDataContext';
import Cookies from 'js-cookie';
import { getIntraIdFromUsername, getUsernameFromIntraId } from '../utils/utils';
import GroupMessage from '../interfaces/chat-group-message.interface';
import CenteredLayout from '../components/UI/CenteredLayout';
import styled from 'styled-components';
import useChatMessageSocket, {
  UseChatMessageSocket,
} from '../components/Chat/useChatMessageSocket';
import { Socket } from 'socket.io-client';

const WrapperDiv = styled.div`
  width: 100%;
  height: 80vh; /* TODO adjust this */
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 40px;
`;

// Define the MessagesByChat type
type MessagesByChat = {
  [key: string]: Message[];
};


/**
 * ChatPage component that displays the chat sidebar and message area.
 * @returns React functional component.
 */
const Chat: React.FC = () => {
  const selectedUser = useRef<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesByChat, setMessagesByChat] = useState<MessagesByChat>({});

  const { userData } = useUserData();

  const [allGroups, setAllGroups] = useState<Group[]>([]);

// Initialize state variables
const [socket, setSocket] = useState<Socket | null>(null);
const [isSocketConnected, setIsSocketConnected] = useState(false);
const [isConnectionError, setIsConnectionError] = useState(false);

// Call useChatMessageSocket at the top level of your component
const {
  chatMessageSocketRef,
  isSocketConnected: connected,
  isConnectionError: error,
}: UseChatMessageSocket = useChatMessageSocket();

useEffect(() => {
  // Update state variables
  setSocket(chatMessageSocketRef.current);
  setIsSocketConnected(connected);
  setIsConnectionError(error);
}, [chatMessageSocketRef, connected, error]);


  useEffect(() => {
    // Fetch all users that the signed in user has chatted with privately
    if (userData) {
      fetchAuthorized(`${getBaseUrl()}/chat/${userData?.intraId}/DM`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      })
        .then((response) => response.json())
        .then((data: User[]) => {
          const users = data.map((item) => {
            return {
              intraId: item.intraId,
              avatar: item.avatar,
              username: item.username,
            };
          });
          setUsers(users);
        });

      // Fetch all groups that the signed in user has chatted in
      fetchAuthorized(`${getBaseUrl()}/chat/${userData?.intraId}/CM`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      })
        .then((response) => response.json())
        .then((data: Group[]) => {
          const groups = data.map((item) => {
            return {
              id: item.id,
              name: item.name,
            };
          });
          setUserGroups(groups);
        });

      // Fetch all existing groups in the database
      fetchAuthorized(`${getBaseUrl()}/chat/allExistingChannel`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      })
        .then((response) => response.json())
        .then((data: Group[]) => {
          const allGroups = data.map((item) => {
            return {
              id: item.id,
              name: item.name,
            };
          });
          setAllGroups(allGroups);
        });
    }
  }, [userData]);

  const [unreadMessages, setUnreadMessages] = useState<{ [key: string]: number }>(() => {
    const savedUnreadMessages = localStorage.getItem('unreadMessages');
    return savedUnreadMessages ? JSON.parse(savedUnreadMessages) : {};
  });

  const [newMessageSent, setNewMessageSent] = useState(false);

  useEffect(() => {
    console.log('unread messages stored in local storage');
    localStorage.setItem('unreadMessages', JSON.stringify(unreadMessages));
  }, [unreadMessages]);


  // Add a listener for incoming messages
  useEffect(() => {
    // console.log('useEffect new message triggered');
    if (isSocketConnected && socket) {
      const privateMessageListener = (messageData: any) => {
        // console.log('private message listener triggered');
        const parsedData = JSON.parse(messageData);
        const newMessage: Message = {
          id: messageData.id,
          senderName: getUsernameFromIntraId(parsedData.senderId)?.toString() || 'Anonymous',
          senderAvatar: getUsernameFromIntraId(parsedData.senderAvatar)?.toString() || 'Anonymous',
          content: parsedData.content,
          timestamp: Date.now().toString(),
        };
        //Append the new message to the messages state
        setMessagesByChat((prevMessages: { [key: string]: Message[] }) => ({
          ...prevMessages,
          [getUsernameFromIntraId(parsedData.senderId)]: [...(prevMessages[getUsernameFromIntraId(parsedData.senderId)] || []), newMessage]
        }));
        console.log('check 1');
        if (parsedData.senderId !== selectedUser?.current?.intraId && 
          !(typeof parsedData.senderId === 'undefined' && typeof selectedUser?.current?.intraId === 'undefined')) {
            console.log('check 2');
            try { 
              setUnreadMessages(prevUnreadMessages => {
                console.log('check 3');

                // Increment the count for the sender
              const updatedUnreadMessages = {
                ...prevUnreadMessages,
                [parsedData.senderId]: (prevUnreadMessages[parsedData.senderId] || 0) + 1,
              };

              // Store the updated count in local storage
              
              console.log('añade mensaje a local storage');
            localStorage.setItem('unreadMessages', JSON.stringify(updatedUnreadMessages));
      
            return updatedUnreadMessages;
          });
        } catch (error) {
          console.log(error);
        }
      }
    };

    const groupMessageListener = (messageData: any) => {
      console.log('group message listener triggered');
      if (!selectedGroup) {
        console.log('no selected group');
        return;
      }
      console.log('group message received');
      const parsedData = JSON.parse(messageData);
      const newMessage: Message = {
        id: messageData.id,
        senderName: getUsernameFromIntraId(parsedData.senderId)?.toString() || 'Anonymous',
        senderAvatar: getUsernameFromIntraId(parsedData.senderAvatar)?.toString() || 'Anonymous',
        content: parsedData.content,
        timestamp: Date.now().toString(),
      };
      // setMessagesByChat((prevMessages: { [key: string]: Message[] }) => ({
      //   ...prevMessages,
      //   [selectedGroup.name]: [...(prevMessages[selectedGroup.name] || []), newMessage]
      // })); 
    };
      // Add the listeners to the socket
      socket.on(`privateMessageReceived/${userData?.intraId.toString()}`, privateMessageListener);
      socket.on('message', groupMessageListener);

    //Clean up the listener when the component unmounts or when the receiverId changes
     return () => {
        if (socket) {
          console.log('cleaning up listeners');
          socket.off(`privateMessageReceived/${userData?.intraId.toString()}`, privateMessageListener);
          socket.off('message', groupMessageListener);
        }
    };
  }
  }, [newMessageSent, isSocketConnected]);


  /**
   * Handles the click event on a user in the chat sidebar.
   * Fetches the messages between the signed in user and the selected user.
   * @param user - The selected user.
   */
  const handleUserClick = (user: User) => {
    const userIntraId = getIntraIdFromUsername(user.username); //temporary until endpoint is fixed
    fetchAuthorized(
      `${getBaseUrl()}/chat/${userData?.intraId}/${userIntraId}/DM`,
      /* temporary until endpoint is fixed */ {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      },
    )
      .then((response) => response.json())
      .then((data: Message[]) => {
        const messages = data.map((item: Message) => {
          return {
            id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            senderName: item.senderName,
            senderAvatar: item.senderAvatar,
            content: item.content,
            timestamp: item.timestamp,
          };
        });
        selectedUser.current = user;
        //setSelectedGroup(null);
        setMessages(messages);
        setMessagesByChat({});
        setUnreadMessages(prevUnreadMessages => ({
          ...prevUnreadMessages,
          [user.intraId]: 0,
        }));
        setUsers((prevUsers) => {
          // Check if the user already exists in the array
          const userExists = prevUsers.some((prevUser) => prevUser.intraId === user.intraId);
          // If the user doesn't exist, add them to the array
          if (!userExists) {
            return [...prevUsers, user];
          }
        
          // If the user does exist, return the previous state
          return prevUsers;
        });
      });
  };

  /**
   * Handles the click event on a group in the chat sidebar.
   * Fetches the messages between the signed in user and the selected group.
   * Sets the selected group and clears the selected user.
   * @param group - The selected group.
   */
  const handleGroupClick = (group: Group) => {
    console.log('i am here baby');
    fetchAuthorized(
      `${getBaseUrl()}/chat/${group.name}/allChannel`,
      /* temporary until endpoint is fixed */ {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      },
    )
      .then((response) => response.json())
      .then((data: GroupMessage[]) => {
        if (data.length > 0) {
        const messages = data.map((item: GroupMessage) => {
          return {
            id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            senderName: item.senderName,
            senderAvatar: item.senderAvatar,
            content: item.content,
            timestamp: item.timestamp,
          };
        });
        setMessages(messages);
      }
        else
          setMessages([]);
        //setSelectedUser(null);
        setSelectedGroup(group);
        setMessagesByChat({});
        setUserGroups((prevGroups) => {
          // Check if the group already exists in the array
          const groupExists = prevGroups.some((prevGroup) => prevGroup.name === group.name);
        
          // If the group doesn't exist, add them to the array
          if (!groupExists) {
            console.log('group does not exist');
            return [...prevGroups, group];
          }
          // If the group does exist, return the previous state
          return prevGroups;
        });
      });
  };

  return (
    <CenteredLayout>
      <WrapperDiv>
        <ChatSidebar
          users={users}
          userGroups={userGroups}
          allGroups={allGroups}
          handleUserClick={handleUserClick}
          handleGroupClick={handleGroupClick}
          unreadMessages={unreadMessages}
          selectedUser={selectedUser.current}
          selectedGroup={selectedGroup}
          socket={socket}
        />
        <ChatMessageArea
          selectedUser={selectedUser.current}
          selectedGroup={selectedGroup}
          messages={messages}
          messagesByChat={messagesByChat}
          setMessagesByChat={setMessagesByChat}
          onNewMessage={() => {
            setNewMessageSent(prevNewMessageSent => !prevNewMessageSent);
          }}
          socket={socket}
        />
      </WrapperDiv>
    </CenteredLayout>
  );
};

export default Chat;
