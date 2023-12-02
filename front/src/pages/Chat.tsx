import React, { useState, useEffect } from 'react';
import ChatSidebar from '../components/Chat/ChatSidebar';
import ChatMessageArea from '../components/Chat/ChatMessageArea';
import Group from '../interfaces/chat-group.interface';
import User from '../interfaces/chat-user.interface';
import DirectMessage from '../interfaces/chat-message.interface';
import GroupMessage from '../interfaces/chat-group-message.interface';
import { useUserData } from '../context/UserDataContext';
import { getUsernameFromIntraId } from '../utils/utils';
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
  [key: string]: DirectMessage[];
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

  const [messages, setMessages] = useState<DirectMessage[]>([]);
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
    const users = await fetchDirectMessageUsers();
    setUsers(users);
  
    const userExists = users.some((u: User) => u.intraId === user.intraId);
  
    if (!userExists) {
      setUsers((prevUsers) => [...prevUsers, user]);
    }
  
    const directMessages = await fetchUserMessages(user);
    setSelectedUser(user);
    setSelectedGroup(null);
    console.log('directMessages', directMessages);
    setMessages(directMessages);
  };

  const handleGroupClick = async (group: Group) => {
    const groupMessages = await fetchGroupMessages(group);
    setSelectedGroup(group);
    setSelectedUser(null);
    console.log('groupMessages', groupMessages.channelMessage);
    setMessages(groupMessages.channelMessage);
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

  useEffect(() => {
    if (isSocketConnected && socket) {
      const privateMessageListener = (messageData: any) => {
        const parsedData = JSON.parse(messageData);
        console.log('messageData', messageData);
        const newMessage: DirectMessage = {
          id: messageData.id,
          senderIntraId: parsedData.senderId,
          receiverIntraId: parsedData.receiverId,
          senderName:
            getUsernameFromIntraId(parsedData.senderId)?.toString() ||
            'Anonymous',
          senderAvatar:
            getUsernameFromIntraId(parsedData.senderAvatar)?.toString() ||
            'Anonymous',
          message: parsedData.content,
          timestamp: Date.now().toString(),
        };
        // setMessagesByChat((prevMessages: { [key: string]: DirectMessage[] }) => ({
        //   ...prevMessages,
        //   [getUsernameFromIntraId(parsedData.senderId)]: [
        //     ...(prevMessages[getUsernameFromIntraId(parsedData.senderId)] ||
        //       []),
        //     newMessage,
        //   ],
        // }));
        if (
          parsedData.senderId !== selectedUser?.intraId &&
          !(
            typeof parsedData.senderId === 'undefined' &&
            typeof selectedUser?.intraId === 'undefined'
          )
        ) {
          try {
            setUnreadMessages((prevUnreadMessages) => {
              const updatedUnreadMessages = {
                ...prevUnreadMessages,
                [parsedData.senderId]:
                  (prevUnreadMessages[parsedData.senderId] || 0) + 1,
              };
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

  function updateUserSidebar() {
    setUpdateChatData((prevState) => !prevState);
  }

  return (
    <CenteredLayout>
      <WrapperDiv>
        <ChatSidebar
          users={users}
          userGroups={userGroups}
          updateUserSidebar={updateUserSidebar}
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
          onNewMessage={(newMessage: DirectMessage | GroupMessage) => {
            setNewMessageSent((prevNewMessageSent) => !prevNewMessageSent);
            if (selectedUser) {
              console.log('new direct message?: ', newMessage);
              handleUserClick(selectedUser);
            }
            else if (selectedGroup) {
              handleGroupClick(selectedGroup);
            }
          }}
          socket={socket}
          setSelectedUser={setSelectedUser}
          setSelectedGroup={setSelectedGroup}
          updateUserGroups={updateUserSidebar}
        />
      </WrapperDiv>
    </CenteredLayout>
  );
};

export default Chat;
