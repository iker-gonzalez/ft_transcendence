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
import { useChatData, useMessageData } from '../context/ChatDataContext';

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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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

  const { fetchDirectMessageUsers, fetchUserGroups, fetchAllGroups } =
    useChatData();

  const [updateChatData, setUpdateChatData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const users = await fetchDirectMessageUsers();
      setUsers(users);

      const userGroups = await fetchUserGroups();
      setUserGroups(userGroups);

      const allGroups = await fetchAllGroups();
      setAllGroups(allGroups);
    };

    fetchData();
  }, [updateChatData]);

  const { fetchUserMessages, fetchGroupMessages } = useMessageData();

  const handleUserClick = async (user: User) => {
    console.log('user', user);
    const directMessages = await fetchUserMessages(user);
    setSelectedUser(user);
    setSelectedGroup(null);
    setMessages(directMessages);
  };

  const handleGroupClick = async (group: Group) => {
    console.log('group', group);
    const groupMessages = await fetchGroupMessages(group);
    setSelectedGroup(group);
    setSelectedUser(null);
    console.log('groupMessages', groupMessages);
    setMessages(groupMessages);
    // ... set state based on messages ...
  };

  const [unreadMessages, setUnreadMessages] = useState<{
    [key: string]: number;
  }>(() => {
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
        const parsedData = JSON.parse(messageData);
        const newMessage: Message = {
          id: messageData.id,
          senderName:
            getUsernameFromIntraId(parsedData.senderId)?.toString() ||
            'Anonymous',
          senderAvatar:
            getUsernameFromIntraId(parsedData.senderAvatar)?.toString() ||
            'Anonymous',
          content: parsedData.content,
          timestamp: Date.now().toString(),
        };
        //Append the new message to the messages state
        setMessagesByChat((prevMessages: { [key: string]: Message[] }) => ({
          ...prevMessages,
          [getUsernameFromIntraId(parsedData.senderId)]: [
            ...(prevMessages[getUsernameFromIntraId(parsedData.senderId)] ||
              []),
            newMessage,
          ],
        }));
        console.log('check 1');
        if (
          parsedData.senderId !== selectedUser?.intraId &&
          !(
            typeof parsedData.senderId === 'undefined' &&
            typeof selectedUser?.intraId === 'undefined'
          )
        ) {
          console.log('check 2');
          try {
            setUnreadMessages((prevUnreadMessages) => {
              console.log('check 3');

              // Increment the count for the sender
              const updatedUnreadMessages = {
                ...prevUnreadMessages,
                [parsedData.senderId]:
                  (prevUnreadMessages[parsedData.senderId] || 0) + 1,
              };

              // Store the updated count in local storage

              console.log('añade mensaje a local storage');
              localStorage.setItem(
                'unreadMessages',
                JSON.stringify(updatedUnreadMessages),
              );

              return updatedUnreadMessages;
            });
          } catch (error) {
            console.log(error);
          }
        }
      };

      const groupMessageListener = (messageData: any) => {
        console.log('group message listener triggered');
        console.log('messageData', messageData);
        if (!selectedGroup) {
          console.log('no selected group');
          return;
        }
        // setMessagesByChat((prevMessages: { [key: string]: Message[] }) => ({
        //   ...prevMessages,
        //   [selectedGroup.name]: [
        //     ...(prevMessages[selectedGroup.name] || []),
        //     messageData.message,
        //   ],
        // }));
      };

      // Add the listeners to the socket
      socket.on(
        `privateMessageReceived/${userData?.intraId.toString()}`,
        privateMessageListener,
      );
      socket.on('message', groupMessageListener);

      //Clean up the listener when the component unmounts or when the receiverId changes
      return () => {
        if (socket) {
          console.log('cleaning up listeners');
          socket.off(
            `privateMessageReceived/${userData?.intraId.toString()}`,
            privateMessageListener,
          );
          socket.off('message', groupMessageListener);
        }
      };
    }
  }, [newMessageSent, isSocketConnected]);

  function updateUserGroups(newGroup: Group) {
    setUpdateChatData((prevState) => !prevState);
  }

  return (
    <CenteredLayout>
      <WrapperDiv>
        <ChatSidebar
          users={users}
          userGroups={userGroups}
          updateUserGroups={updateUserGroups}
          allGroups={allGroups}
          handleUserClick={handleUserClick}
          handleGroupClick={handleGroupClick}
          unreadMessages={unreadMessages}
          selectedUser={selectedUser}
          selectedGroup={selectedGroup}
          socket={socket}
        />
        <ChatMessageArea
          selectedUser={selectedUser}
          selectedGroup={selectedGroup}
          messages={messages}
          messagesByChat={messagesByChat}
          setMessagesByChat={setMessagesByChat}
          onNewMessage={() => {
            setNewMessageSent((prevNewMessageSent) => !prevNewMessageSent);
          }}
          socket={socket}
          setSelectedUser={setSelectedUser}
          setSelectedGroup={setSelectedGroup}
          updateUserGroups={updateUserGroups}
        />
      </WrapperDiv>
    </CenteredLayout>
  );
};

export default Chat;
