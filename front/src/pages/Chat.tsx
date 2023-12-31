import React, { useState, useEffect } from 'react';
import ChatSidebar from '../components/Chat/ChatSidebar';
import ChatMessageArea from '../components/Chat/ChatMessageArea';
import Group from '../interfaces/chat-group.interface';
import User from '../interfaces/chat-user.interface';
import DirectMessage from '../interfaces/chat-message.interface';
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
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Cookies from 'js-cookie';
import { sm } from '../constants/styles';
import ArrowLeftIcon from '../assets/svg/arrow-left.svg';
import { darkBgColor, darkestBgColor } from '../constants/color-tokens';

const WrapperDiv = styled.div`
  width: 100%;
  height: 100%;
  min-height: 80vh;

  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 24px;

  position: relative;

  @media (width < ${sm}) {
    padding-top: 32px;
    flex: 1;
  }

  .sidebar-button {
    background: ${darkBgColor};
    padding: 2px 16px;
    border-radius: 8px;
    outline: 1px ${darkestBgColor} solid;

    white-space: nowrap;
    position: absolute;
    top: -16px;
    left: 4px;

    > img {
      width: 24px;
      height: 24px;
    }

    @media (width > ${sm}) {
      display: none;
    }
  }

  .sidebar-container {
    flex-basis: 30%;

    @media (width < ${sm}) {
      display: none;
      flex-basis: 100%;

      &.show {
        display: block;
      }
    }
  }

  .message-area-container {
    width: 100%;
    height: auto;

    @media (width < ${sm}) {
      display: none;
      &.show {
        display: block;
        width: 100%;
      }
    }
  }
`;

const Chat: React.FC = () => {
  const navigate = useNavigate();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);

  const [messages, setMessages] = useState<DirectMessage[]>([]);

  const { userData, fetchUserData, isUserDataFetching } = useUserData();

  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [channelData, setChannelData] = useState<ChannelData | null>(null);

  // Initialize state variables
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // Call useChatMessageSocket at the top level of your component
  const {
    chatMessageSocketRef,
    isSocketConnected: connected,
    isConnectionError: error,
  }: UseChatMessageSocket = useChatMessageSocket();

  const [showMobileSidebar, setShowMobileSidebar] = useState(true);

  useEffect(() => {
    if (selectedUser || selectedGroup) {
      setShowMobileSidebar(false);
    } else {
      setShowMobileSidebar(true);
    }
  }, [selectedUser, selectedGroup]);

  useEffect(() => {
    if (!userData) {
      const token = Cookies.get('token');
      if (token) {
        fetchUserData(token);
      } else {
        navigate('/');
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isUserDataFetching && userData) {
      fetchData();
    }
  }, [isUserDataFetching]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Update state variables
    setSocket(chatMessageSocketRef.current);
    setIsSocketConnected(connected);
  }, [chatMessageSocketRef, connected, error]);

  const { fetchDirectMessageUsers, fetchUserGroups, fetchAllGroups } =
    useChatData();

  const [updateChatData, setUpdateChatData] = useState(false);

  const fetchData = async () => {
    const users = await fetchDirectMessageUsers();
    setUsers(users);

    const userGroups = await fetchUserGroups();
    setUserGroups(userGroups);

    const allGroups = await fetchAllGroups();
    setAllGroups(allGroups);
  };

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { fetchUserMessages, fetchGroupMessages } = useMessageData();
  const { fetchChannelData } = useChannelData();

  const handleUserClick = async (user: User) => {
    const userAlreadyExists = users.find(
      (u: User) => u.intraId === user.intraId,
    );
    if (!userAlreadyExists) {
      setUsers((prevState) => [...prevState, user]);
    }

    const directMessages: DirectMessage[] = await fetchUserMessages(
      user.intraId,
    );

    if (directMessages && directMessages.length > 0) {
      setMessages(directMessages);
    } else {
      setMessages([]);
    }
  };

  const handleGroupClick = async (
    userIntra: number | undefined,
    group: Group,
  ) => {
    if (!userIntra) return;

    const groupInfo = await fetchGroupMessages(userIntra, group);
    let groupMessages: DirectMessage[] = [];

    if (groupInfo.channelMessage) {
      const channelMessage = await groupInfo.channelMessage;
      if (channelMessage.length > 0) {
        groupMessages = channelMessage.map((message: DirectMessage) => ({
          ...message,
        }));
      }
    }

    setMessages(groupMessages);
    const freshChannelData = await fetchChannelData(userIntra, group.name);
    setChannelData(freshChannelData);
  };

  const [newMessageSent, setNewMessageSent] = useState(false);

  useEffect(() => {
    if (isSocketConnected && socket) {
      const privateMessageListener = async (messageData: string) => {
        const {
          content,
          receiverIntraId,
          receiverName,
          createdAt,
          senderIntraId,
          senderAvatar,
          senderName,
        } = JSON.parse(messageData);

        const isCurrentUserSender = selectedUser?.intraId === senderIntraId;
        const isCurrentUserReceiver = selectedUser?.intraId === receiverIntraId;

        if ((isCurrentUserSender || isCurrentUserReceiver) && !selectedGroup) {
          setMessages((prevState: any[]) => {
            const newMessage = {
              content,
              createdAt,
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
        const {
          content,
          roomName,
          createdAt,
          senderIntraId,
          senderAvatar,
          senderName,
        } = JSON.parse(messageData);

        const isCurrentChannel = selectedGroup?.name === roomName;
        if (isCurrentChannel && !selectedUser) {
          setMessages((prevState: any[]) => {
            const newMessage = {
              content,
              roomName,
              createdAt,
              senderIntraId,
              senderAvatar,
              senderName,
            } as any;
            return [...prevState, newMessage];
          });
        }
        updateUserSidebar();
      };

      const refreshDataListener = () => {
        // Update the sidebar
        fetchData();
      };

      if (userData) {
        // Add the listeners to the socket
        socket.on(
          `privateMessageReceived/${userData.intraId.toString()}`,
          privateMessageListener,
        );
        socket.on(
          `groupMessage/${userData.intraId.toString()}`,
          groupMessageListener,
        );

        socket.on('newData', refreshDataListener);
      }

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
  }, [newMessageSent, isSocketConnected, selectedUser, selectedGroup]); // eslint-disable-line react-hooks/exhaustive-deps

  function updateUserSidebar() {
    setUpdateChatData((prevState) => !prevState);
  }

  if (!userData && isUserDataFetching) {
    return (
      <CenteredLayout>
        <LoadingSpinner />
      </CenteredLayout>
    );
  }

  return (
    <CenteredLayout>
      <WrapperDiv>
        {!showMobileSidebar && (
          <button
            onClick={() => {
              setShowMobileSidebar(true);
            }}
            className="sidebar-button"
          >
            <img src={ArrowLeftIcon} alt="Back to sidebar" />
          </button>
        )}
        <div className={`sidebar-container ${showMobileSidebar ? 'show' : ''}`}>
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
        </div>
        <div
          className={`message-area-container ${
            showMobileSidebar ? '' : 'show'
          } `}
        >
          <ChatMessageArea
            selectedUser={selectedUser}
            users={users}
            setUsers={setUsers}
            selectedGroup={selectedGroup}
            messages={messages}
            updateUserSidebar={updateUserSidebar}
            onNewMessage={(newMessage: any) => {
              setNewMessageSent((prevNewMessageSent) => !prevNewMessageSent);
              if (selectedUser)
                setMessages((prevState) => [...prevState, newMessage]);
              else if (selectedGroup)
                setMessages((prevState) => [...prevState, newMessage]);
            }}
            socket={socket}
            setSelectedUser={setSelectedUser}
            setSelectedGroup={setSelectedGroup}
            channelData={channelData}
            setMessages={setMessages}
            onNewAction={handleGroupClick}
          />
        </div>
      </WrapperDiv>
    </CenteredLayout>
  );
};

export default Chat;
