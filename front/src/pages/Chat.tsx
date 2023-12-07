import React, { useState, useEffect } from 'react';
import ChatSidebar from '../components/Chat/ChatSidebar';
import ChatMessageArea from '../components/Chat/ChatMessageArea';
import Group from '../interfaces/chat-group.interface';
import User from '../interfaces/chat-user.interface';
import DirectMessage from '../interfaces/chat-message.interface';
import GroupMessage from '../interfaces/chat-group-message.interface';
import { useUserData } from '../context/UserDataContext';
import CenteredLayout from '../components/UI/CenteredLayout';
import styled from 'styled-components';
import useChatMessageSocket, {
  UseChatMessageSocket,
} from '../components/Chat/useChatMessageSocket';
import { Socket } from 'socket.io-client';
import { useChatData, useMessageData } from '../context/ChatDataContext';
import { ChannelData } from '../interfaces/chat-channel-data.interface';
import { useChannelData } from '../context/ChatDataContext';
import { useNavigate } from 'react-router-dom';

const WrapperDiv = styled.div`
  width: 100%;
  height: 80vh; /* TODO adjust this */
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 40px;
`;

/**
 * ChatPage component that displays the chat sidebar and message area.
 * @returns React functional component.
 */
const Chat: React.FC = () => {
  const navigate = useNavigate();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);

  const [messages, setMessages] = useState<DirectMessage[]>([]);

  const { userData } = useUserData();

  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [channelData, setChannelData] = useState<ChannelData | null>(null);

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
    if (!userData) {
      navigate('/');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
  const { fetchChannelData } = useChannelData();

  const handleUserClick = async (user: User) => {
    const users = await fetchDirectMessageUsers();
    setUsers(users);

    const userExists = users.some((u: User) => u.intraId === user.intraId);

    if (!userExists) {
      setUsers((prevUsers) => [...prevUsers, user]);
    }

    const directMessages: DirectMessage[] = await fetchUserMessages(
      user.intraId,
    );
    // setSelectedUser(user);
    // setSelectedGroup(null);
    setMessages(directMessages);
  };

  const handleGroupClick = async (group: Group) => {
    const groupInfo = await fetchGroupMessages(group);
    const groupMessages: DirectMessage[] = groupInfo.channelMessage.map(
      (message: DirectMessage) => ({
        ...message,
      }),
    );
    // setSelectedGroup(group);
    // setSelectedUser(null);
    setMessages(groupMessages);

    const freshChannelData = await fetchChannelData(group.name);
    setChannelData(freshChannelData);
  };

  const [newMessageSent, setNewMessageSent] = useState(false);

  useEffect(() => {
    if (isSocketConnected && socket) {
      const privateMessageListener = async (messageData: string) => {
        console.log('========privateMessageListener=======', messageData);
        const {
          content,
          receiverIntraId,
          receiverName,
          timestamp,
          senderIntraId,
          senderAvatar,
          senderName,
        } = JSON.parse(messageData);

        const isCurrentUserSender = selectedUser?.intraId === senderIntraId;
        const isCurrentUserReceiver = selectedUser?.intraId === receiverIntraId;

        console.log('selectedUser', selectedUser);
        console.log('selectedGroup', selectedGroup);

        if ((isCurrentUserSender || isCurrentUserReceiver) && !selectedGroup) {
          setMessages((prevState: any[]) => {
            const newMessage = {
              content,
              createdAt: new Date(timestamp).toISOString(),
              receiverAvatar: '',
              receiverName,
              roomName: null,
              senderAvatar,
              senderName,
            } as any;
            return [...prevState, newMessage];
          });
        }
        updateUserSidebar();
      };

      const groupMessageListener = (messageData: string) => {
        console.log('=====groupMessageListener=======', messageData);
          const {
            content,
            roomName,
            timestamp,
            senderIntraId,
            senderAvatar,
            senderName,
          } = JSON.parse(messageData);
          
          const isCurrentChannel = selectedGroup?.name === roomName;
          console.log('selectedUser', selectedUser);
          console.log('selectedGroup', selectedGroup);
          if (isCurrentChannel && !selectedUser) {
            setMessages((prevState: any[]) => {
              const newMessage = {
                content,
                roomName,
                createdAt: new Date(timestamp).toISOString(),
                senderIntraId,
                senderAvatar,
                senderName,
              } as any;
              return [...prevState, newMessage];
            });
          }
          updateUserSidebar();
      };

      // Add the listeners to the socket
      socket.on(
        `privateMessageReceived/${userData?.intraId.toString()}`,
        privateMessageListener,
      );
      socket.on(
        `groupMessage/${userData?.intraId.toString()}`,
        groupMessageListener,
      );

      //Clean up the listener when the component unmounts or when the receiverId changes
      return () => {
        if (socket) {
          socket.off(
            `privateMessageReceived/${userData?.intraId.toString()}`,
            privateMessageListener,
          );
          socket.off(
            `groupMessage/${userData?.intraId.toString()}`,
            groupMessageListener,
          );
        }
      };
    }
  }, [newMessageSent, isSocketConnected, selectedUser, selectedGroup]);

  function updateUserSidebar() {
    setUpdateChatData((prevState) => !prevState);
  }

  // console.log('========chat page=======');
  // console.log('selectedUser', selectedUser);
  // console.log('selectedGroup', selectedGroup);

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
          selectedUser={selectedUser}
          selectedGroup={selectedGroup}
          socket={socket}
          channelData={channelData}
          setSelectedUser={setSelectedUser}
          setSelectedGroup={setSelectedGroup}
        />
        <ChatMessageArea
          selectedUser={selectedUser}
          users={users}
          setUsers={setUsers}
          selectedGroup={selectedGroup}
          messages={messages}
          updateUserSidebar={updateUserSidebar}
          onNewMessage={(newMessage: any) => {
            setNewMessageSent((prevNewMessageSent) => !prevNewMessageSent);
            if (selectedUser) {
              // console.log('new direct message?: ', newMessage);
              handleUserClick(selectedUser);
            } else if (selectedGroup) {
              // console.log('new group message?: ', newMessage);
              setMessages((prevState) => [...prevState, newMessage]);
            }
          }}
          socket={socket}
          setSelectedUser={setSelectedUser}
          setSelectedGroup={setSelectedGroup}
          channelData={channelData}
          setMessages={setMessages}
          onNewAction={handleGroupClick}
        />
      </WrapperDiv>
    </CenteredLayout>
  );
};

export default Chat;
