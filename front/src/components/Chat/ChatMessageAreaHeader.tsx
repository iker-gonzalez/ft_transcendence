import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MainButton from '../UI/MainButton';
import RoundImg from '../UI/RoundImage';
import FriendData from '../../interfaces/friend-data.interface';
import { useUserFriends, useUserData } from '../../context/UserDataContext';
import ViewNewUserProfile from '../Friends/ViewNewUserProfile';
import Modal from '../UI/Modal';
import { useFlashMessages } from '../../context/FlashMessagesContext';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import Group from '../../interfaces/chat-group.interface';
import User from '../../interfaces/chat-user.interface';

const HeaderWrapper = styled.div`
  position: relative; // Add this line
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  border-bottom: 1px solid white;
`;

const Title = styled.h2`
  font-size: 33px;
  font-weight: bold;
  margin-bottom: 10px;
  margin-left: 90px; // Add this line
`;
const Avatar = styled(RoundImg)`
  position: absolute; // Add this line
  left: 15px; // Add this line
  top: 5px; // Add this line
  width: 60px;
  height: 60px;
  margin-right: 0px;
`;

const MainButtonStyled = styled(MainButton)`
  margin-left: 15px;
  margin-bottom: 25px;
  margin-top: 15px;
  margin-right: 15px;
`;

interface ChatMessageAreaHeaderProps {
    user?: User | null;
    group?: Group | null;
  }

const ChatMessageAreaHeader: React.FC<ChatMessageAreaHeaderProps> = ({ user, group }) => {
    const [friendProfileToShow, setFriendProfileToShow] =
    useState<FriendData | null>(null);
  const [showAddNewFriendFlow, setShowAddNewFriendFlow] =
    useState<boolean>(false);

  const { userFriends, setUserFriends, fetchFriendsList, isFetchingFriends } =
    useUserFriends();

    const friend = userFriends.find(userFriend => userFriend.username === user?.username) || null;

  const { launchFlashMessage } = useFlashMessages();

  useEffect(() => {
    fetchFriendsList();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onUpdateFriendsList = (
    newFriendsList: FriendData[],
    successMessage: string,
  ): void => {
    setUserFriends(newFriendsList);
    setFriendProfileToShow(null);
    setShowAddNewFriendFlow(false);

    launchFlashMessage(successMessage, FlashMessageLevel.SUCCESS);
  };
  
    return (
        <HeaderWrapper>
        <div>
            {user && <Avatar src={user.avatar} alt={user.username} />}
            <Title style={{ marginLeft: group ? '0' : '', marginBottom: group ? '15px' : '' }}>
                {user?.username || group?.name || ''}
            </Title>        
        </div>
        {user && (
            <div>
            <MainButtonStyled onClick={() => console.log('Play button clicked')}>Play</MainButtonStyled>
            <MainButtonStyled onClick={() => setFriendProfileToShow(friend)}>Profile</MainButtonStyled>
            <MainButtonStyled onClick={() => console.log('Block button clicked')}>Block</MainButtonStyled>
            </div>
        )}
        {group && (
            <div>
              <MainButtonStyled onClick={() => console.log('Actions button clicked')}>Actions</MainButtonStyled>
              <MainButtonStyled onClick={() => console.log('Protect button clicked')}>Password</MainButtonStyled>
            </div>
        )}
        {friendProfileToShow && (
            <Modal
            dismissModalAction={() => {
                setFriendProfileToShow(null);
            }}
            showFullScreen={true}
            >
            <ViewNewUserProfile
                foundUserData={friendProfileToShow}
                isAlreadyFriend={true}
                onUpdateFriendsList={onUpdateFriendsList}
            />
            </Modal>
        )}
        </HeaderWrapper>
    );
  };
  
  export default ChatMessageAreaHeader;