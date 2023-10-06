import React from 'react';
import styled from 'styled-components';
import UserCoreData from '../../interfaces/user-core-data.interface';
import RoundImg from '../UI/RoundImage';
import MainButton from '../UI/MainButton';
import SecondaryButton from '../UI/SecondaryButton';
import { getBaseUrl } from '../../utils/utils';
import Cookies from 'js-cookie';
import FriendData from '../../interfaces/friend-data.interface';

const WrapperDiv = styled.div`
  .user-info-container {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 20px;

    .avatar {
      width: 150px;
    }
  }

  .actions-container {
    display: flex;
    justify-content: center;
    align-items: center;

    padding-top: 40px;
  }
`;

type ViewNewUserProfileProps = {
  foundUserData: UserCoreData;
  isAlreadyFriend?: boolean;
  onUpdateFriendsList: (
    friendsList: FriendData[],
    successMessage: string,
  ) => void;
};

const ViewNewUserProfile: React.FC<ViewNewUserProfileProps> = ({
  foundUserData,
  isAlreadyFriend,
  onUpdateFriendsList,
}): JSX.Element => {
  const addUserToFriend = async () => {
    const res: Response = await fetch(
      `${getBaseUrl()}/friends/${foundUserData.intraId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      },
    );

    const data: {
      created: number;
      data: any;
    } = await res.json();

    if (data.created === 1) {
      const friendsList: FriendData[] = data.data.friends;
      const successMessage = foundUserData!.username + 'was added to friends!';
      onUpdateFriendsList(friendsList, successMessage);
    } else {
      // TODO Set some error state here
    }
  };

  const removeUserFromFriends = async () => {
    const res: Response = await fetch(
      `${getBaseUrl()}/friends/${foundUserData.intraId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      },
    );

    const data: {
      deleted: number;
      data: any;
    } = await res.json();

    console.log('data', data);

    if (data.deleted === 1) {
      const successMessage: string = `${
        foundUserData!.username
      } was removed from your friends!`;
      onUpdateFriendsList(data.data.friends, successMessage);
    } else {
      // TODO Set some error state here
    }
  };

  return (
    <WrapperDiv>
      <div className="user-info-container">
        <RoundImg src={foundUserData.avatar} alt="" className="avatar" />
        <div>
          <h2 className="title-2 mb-8">{foundUserData.username}</h2>
          <p className="small">{foundUserData.email}</p>
        </div>
      </div>
      <div className="actions-container">
        {isAlreadyFriend ? (
          <SecondaryButton onClick={removeUserFromFriends}>
            Unfriend 💔
          </SecondaryButton>
        ) : (
          <MainButton onClick={addUserToFriend}>Add to friends</MainButton>
        )}
      </div>
    </WrapperDiv>
  );
};

export default ViewNewUserProfile;
