import React from 'react';
import MainButton from '../UI/MainButton';
import styled from 'styled-components';

const WrapperDiv = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 75px;

  .friend-search-cta {
    white-space: nowrap;
  }
`;

type UserProfileFriendsEmptyStateProps = {
  setShowAddNewFriendFlow: React.Dispatch<React.SetStateAction<boolean>>;
};

const UserProfileFriendsEmptyState: React.FC<
  UserProfileFriendsEmptyStateProps
> = ({ setShowAddNewFriendFlow }): JSX.Element => {
  return (
    <WrapperDiv>
      <div>
        <p>It's easy to make new friends 👥</p>
        <p>Just search for a user to add them to your friends list.</p>
      </div>
      <MainButton
        className="friend-search-cta"
        onClick={() => {
          setShowAddNewFriendFlow(true);
        }}
      >
        Start searching
      </MainButton>
    </WrapperDiv>
  );
};

export default UserProfileFriendsEmptyState;
