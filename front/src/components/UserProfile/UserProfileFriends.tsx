import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import ContrastPanel from '../UI/ContrastPanel';
import RoundImg from '../UI/RoundImage';
import MainButton from '../UI/MainButton';
import SecondaryButton from '../UI/SecondaryButton';
import AddNewFriendFlow from '../Friends/AddNewFriendFlow';
import ViewNewUserProfile from '../Friends/ViewNewUserProfile';
import Modal from '../UI/Modal';
import FriendData from '../../interfaces/friend-data.interface';
import FlashMessage from '../UI/FlashMessage';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import { primaryLightColor } from '../../constants/color-tokens';
import { useUserFriends } from '../../context/UserDataContext';
import UserProfileFriendsEmptyState from './UserProfileFriendsEmptyState';

const WrapperDiv = styled.div`
  position: relative;
  width: 650px;

  .user-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;

    .user-info {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 20px;
      .avatar {
        width: 75px;
        height: auto;
      }
    }
  }

  .friends-list {
    > * {
      margin-bottom: 16px;
    }

    border-bottom: 1px ${primaryLightColor} solid;
  }

  .search-friends-container {
    display: flex;
    justify-content: space-between;
    align-items: center;

    margin-top: 25px;
  }
`;

const UserProfileFriends: React.FC = (): JSX.Element => {
  const [showFriendProfile, setShowFriendProfile] = useState<boolean>(false);
  const [showAddNewFriendFlow, setShowAddNewFriendFlow] =
    useState<boolean>(false);

  const [newFriendSuccessMessage, setNewFriendSuccessMessage] =
    useState<string>('');
  const [removeFriendSuccessMessage, setRemoveFriendSuccessMessage] =
    useState<string>('');

  const { userFriends, setUserFriends, fetchFriendsList, isFetchingFriends } =
    useUserFriends();

  useEffect(() => {
    fetchFriendsList();

    return () => {
      setNewFriendSuccessMessage('');
      setRemoveFriendSuccessMessage('');
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onRemoveAFriendFromList = (
    newFriendsList: FriendData[],
    successMessage: string,
  ): void => {
    setUserFriends(newFriendsList);
    setShowFriendProfile(false);
    setRemoveFriendSuccessMessage(successMessage);
  };

  const onAddAFriendToList = (
    newFriendsList: FriendData[],
    successMessage: string,
  ): void => {
    setUserFriends(newFriendsList);
    setShowAddNewFriendFlow(false);
    setNewFriendSuccessMessage(successMessage);
  };

  return (
    <>
      <ContrastPanel>
        <WrapperDiv>
          {isFetchingFriends ? (
            <p>Loading...</p>
          ) : (
            <>
              <h2 className="title-2 mb-24">Friends</h2>
              <div>
                {userFriends.length ? (
                  <div>
                    <ul className="friends-list">
                      {userFriends.map((friend) => {
                        return (
                          <li key={friend.intraId} className="user-item">
                            <div className="user-info">
                              <RoundImg
                                src={friend.avatar}
                                alt=""
                                className="avatar"
                              />
                              <div>
                                <h3 className="title-2 mb-8">
                                  {friend.username}
                                </h3>
                                <p className="small mb-8">{friend.email}</p>
                              </div>
                            </div>
                            <MainButton
                              onClick={() => setShowFriendProfile(true)}
                            >
                              See profile
                            </MainButton>
                            {showFriendProfile && (
                              <Modal
                                dismissModalAction={() => {
                                  setShowFriendProfile(false);
                                }}
                              >
                                <ViewNewUserProfile
                                  foundUserData={friend}
                                  isAlreadyFriend={true}
                                  onRemoveAFriendFromList={
                                    onRemoveAFriendFromList
                                  }
                                />
                              </Modal>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                    <div className="search-friends-container">
                      <h3 className="title-3">
                        On the look for new game mates?
                      </h3>
                      <SecondaryButton
                        onClick={() => {
                          setShowAddNewFriendFlow(true);
                        }}
                      >
                        Search now
                      </SecondaryButton>
                    </div>
                  </div>
                ) : (
                  <UserProfileFriendsEmptyState
                    setShowAddNewFriendFlow={setShowAddNewFriendFlow}
                  />
                )}
              </div>
              {showAddNewFriendFlow && (
                <AddNewFriendFlow
                  setShowAddNewFriendFlow={setShowAddNewFriendFlow}
                  onAddAFriendToList={onAddAFriendToList}
                />
              )}
            </>
          )}
        </WrapperDiv>
      </ContrastPanel>
      {!!removeFriendSuccessMessage.length && (
        <FlashMessage
          text={removeFriendSuccessMessage}
          level={FlashMessageLevel.SUCCESS}
        />
      )}
      {!!newFriendSuccessMessage.length && (
        <FlashMessage
          text={newFriendSuccessMessage}
          level={FlashMessageLevel.SUCCESS}
        />
      )}
    </>
  );
};

export default UserProfileFriends;
