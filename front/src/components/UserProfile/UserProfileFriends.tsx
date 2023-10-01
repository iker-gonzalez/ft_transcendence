import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import ContrastPanel from '../UI/ContrastPanel';
import Lottie from 'lottie-react';
import emptyGhostAnimation from '../../assets/lotties/empty-ghost.json';
import { getBaseUrl } from '../../utils/utils';
import Cookies from 'js-cookie';
import RoundImg from '../UI/RoundImage';
import { PrimaryLink } from '../UI/PrimaryLink';

const WrapperDiv = styled.div`
  position: relative;
  width: 650px;

  .empty-state {
    max-width: 380px;

    .empty-animation {
      width: 100px;
      position: absolute;
      top: 50%;
      right: 50px;
      transform: translateY(-50%);
    }
  }

  .user-item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 20px;

    .avatar {
      width: 75px;
      height: auto;
    }
  }
`;

const UserProfileFriends: React.FC = (): JSX.Element => {
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [areFriendsLoaded, setAreFriendsLoaded] = useState<boolean>(false);

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
                          <RoundImg
                            src={friend.avatar}
                            alt=""
                            className="avatar"
                          />
                          <div>
                            <h3 className="title-2 mb-8">{friend.username}</h3>
                            <p className="small mb-8">{friend.email}</p>
                            <PrimaryLink to="/" className="link">
                              See profile
                            </PrimaryLink>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div className="empty-state">
                  <p className="mb-16">It looks like you're a bit lonely 😿</p>
                  <p>
                    It's easy to make new friends. Just search for a user to add
                    them to your friends list.
                  </p>
                  <Lottie
                    animationData={emptyGhostAnimation}
                    loop={true}
                    className="empty-animation"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>
          </>
        )}
      </WrapperDiv>
    </ContrastPanel>
  );
};

export default UserProfileFriends;
