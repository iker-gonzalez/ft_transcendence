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
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import { primaryLightColor } from '../../constants/color-tokens';
import { useUserFriends } from '../../context/UserDataContext';
import { useFlashMessages } from '../../context/FlashMessagesContext';
import LoadingSpinner from '../UI/LoadingSpinner';
import PaginatedSection from '../UI/PaginatedSection';
import UserStatusInfo from '../UI/UserStatus';
import RefreshIcon from '../../assets/svg/refresh.svg';
import { sm } from '../../constants/styles';

const WrapperDiv = styled.div`
  position: relative;

  .title-container {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .refresh-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;

      .icon {
        width: 20px;
        object-fit: contain;
        transition: transform 0.3s ease-in-out;
      }

      &:hover {
        .icon {
          transform: rotate(90deg);
        }
      }
    }
  }

  .centered-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

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

      margin-right: auto;
      .avatar {
        display: none;

        @media (width > ${sm}) {
          display: block;
          width: 75px;
          height: auto;
        }
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
    gap: 30px;

    margin-top: 25px;
  }
`;

const UserProfileFriends: React.FC = (): JSX.Element => {
  const [friendProfileToShow, setFriendProfileToShow] =
    useState<FriendData | null>(null);
  const [showAddNewFriendFlow, setShowAddNewFriendFlow] =
    useState<boolean>(false);

  const { userFriends, setUserFriends, fetchFriendsList, isFetchingFriends } =
    useUserFriends();
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
    <ContrastPanel>
      <WrapperDiv>
        <div className="title-container mb-24">
          <h2 className="title-2">Friends</h2>
          {Boolean(userFriends.length) && (
            <SecondaryButton
              onClick={() => {
                fetchFriendsList();
              }}
              className="refresh-btn"
            >
              Refresh <img src={RefreshIcon} alt="" className="icon" />
            </SecondaryButton>
          )}
        </div>
        {(() => {
          if (isFetchingFriends) {
            return (
              <div className="centered-container">
                <LoadingSpinner />
              </div>
            );
          }

          if (userFriends.length) {
            return (
              <>
                <PaginatedSection numberOfItems={2}>
                  <ul className="friends-list">
                    {userFriends
                      .sort((a, b) => a.username.localeCompare(b.username))
                      .map((friend) => {
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
                            <UserStatusInfo intraId={friend.intraId} />
                            <MainButton
                              onClick={() => setFriendProfileToShow(friend)}
                            >
                              {window.innerWidth > parseInt(sm) ? (
                                'View profile'
                              ) : (
                                <span aria-label="view-profile">👤</span>
                              )}
                            </MainButton>
                          </li>
                        );
                      })}
                  </ul>
                </PaginatedSection>
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
              </>
            );
          }
        })()}
        <div>
          <div className="search-friends-container">
            <h3>On the lookout for new game mates?</h3>
            <SecondaryButton
              onClick={() => {
                setShowAddNewFriendFlow(true);
              }}
            >
              Search
            </SecondaryButton>
          </div>
        </div>
        {showAddNewFriendFlow && (
          <AddNewFriendFlow
            setShowAddNewFriendFlow={setShowAddNewFriendFlow}
            onUpdateFriendsList={onUpdateFriendsList}
            userFriends={userFriends}
          />
        )}
      </WrapperDiv>
    </ContrastPanel>
  );
};

export default UserProfileFriends;
