import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import ContrastPanel from '../UI/ContrastPanel';
import { getBaseUrl } from '../../utils/utils';
import Cookies from 'js-cookie';
import RoundImg from '../UI/RoundImage';
import MainButton from '../UI/MainButton';
import AddNewFriendFlow from '../Friends/AddNewFriendFlow';
import ViewNewUserProfile from '../Friends/ViewNewUserProfile';
import Modal from '../UI/Modal';

const WrapperDiv = styled.div`
  position: relative;
  width: 650px;

  .empty-state {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 75px;

    .friend-search-cta {
      white-space: nowrap;
    }
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
      .avatar {
        width: 75px;
        height: auto;
      }
    }
  }
`;

const UserProfileFriends: React.FC = (): JSX.Element => {
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [areFriendsLoaded, setAreFriendsLoaded] = useState<boolean>(false);
  const [showFriendProfile, setShowFriendProfile] = useState<boolean>(false);
  const [showAddNewFriendFlow, setShowAddNewFriendFlow] =
    useState<boolean>(false);

  useEffect(() => {
    // TODO move this to context
    const fetchFriendsList = async (): Promise<void> => {
      const response: Response = await fetch(`${getBaseUrl()}/friends`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });

      const data = await response.json();

      setAreFriendsLoaded(true);

      const friendsList: any[] = data.data.friends;
      if (friendsList.length) {
        setFriendsList(friendsList);
      }
    };

    fetchFriendsList();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ContrastPanel>
      <WrapperDiv>
        {!areFriendsLoaded && <p>Loading...</p>}
        {areFriendsLoaded && (
          <>
            <h2 className="title-2 mb-24">Friends</h2>
            <div>
              {friendsList.length ? (
                <div>
                  <ul>
                    {friendsList.map((friend) => {
                      console.log(friend);
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
                              />
                            </Modal>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div className="empty-state">
                  <div>
                    <p className="mb-16">
                      It looks like you're a bit lonely 😿
                    </p>
                    <p>
                      It's easy to make new friends. Just search for a user to
                      add them to your friends list.
                    </p>
                  </div>
                  <MainButton
                    className="friend-search-cta"
                    onClick={() => {
                      setShowAddNewFriendFlow(true);
                    }}
                  >
                    Start searching
                  </MainButton>
                </div>
              )}
            </div>
            {showAddNewFriendFlow && (
              <AddNewFriendFlow
                setShowAddNewFriendFlow={setShowAddNewFriendFlow}
              />
            )}
          </>
        )}
      </WrapperDiv>
    </ContrastPanel>
  );
};

export default UserProfileFriends;
