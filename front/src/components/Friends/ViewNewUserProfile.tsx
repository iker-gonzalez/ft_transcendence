import React from 'react';
import styled from 'styled-components';
import UserCoreData from '../../interfaces/user-core-data.interface';
import RoundImg from '../UI/RoundImage';
import MainButton from '../UI/MainButton';
import SecondaryButton from '../UI/SecondaryButton';
import { fetchAuthorized, getBaseUrl } from '../../utils/utils';
import Cookies from 'js-cookie';
import FriendData from '../../interfaces/friend-data.interface';
import { useFlashMessages } from '../../context/FlashMessagesContext';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import UserProfileStats from '../UserProfile/UserProfileStats';

type AddNewFriendResponse = {
  created?: number;
  data?: any;
  message?: string;
};

type DeleteFriendResponse = {
  deleted?: number;
  data?: any;
  message?: string;
};

const WrapperDiv = styled.div`
  .user-info-container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;

    .avatar {
      width: 125px;
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
  const { launchFlashMessage } = useFlashMessages();

  const addUserToFriend = async () => {
    const res: Response = await fetchAuthorized(
      `${getBaseUrl()}/friends/${foundUserData.intraId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      },
    );

    const data: AddNewFriendResponse = await res.json();

    if (data.created === 1) {
      const friendsList: FriendData[] = data.data.friends;
      const successMessage = foundUserData!.username + ' was added to friends!';
      onUpdateFriendsList(friendsList, successMessage);
    } else {
      const errorMessage = data.message!;
      console.warn('Error adding a new friend:', errorMessage);
      launchFlashMessage(errorMessage, FlashMessageLevel.ERROR);
    }
  };

  const removeUserFromFriends = async () => {
    const res: Response = await fetchAuthorized(
      `${getBaseUrl()}/friends/${foundUserData.intraId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      },
    );

    const data: DeleteFriendResponse = await res.json();

    if (data.deleted === 1) {
      const successMessage: string = `${
        foundUserData!.username
      } was removed from your friends!`;
      onUpdateFriendsList(data.data.friends, successMessage);
    } else {
      const errorMessage = data.message!;
      console.warn('Error adding a new friend:', errorMessage);
      launchFlashMessage(errorMessage, FlashMessageLevel.ERROR);
    }
  };

  return (
    <WrapperDiv>
      <div className="user-info-container mb-24">
        <RoundImg src={foundUserData.avatar} alt="" className="avatar" />
        <div>
          <h2 className="title-2 mb-8">{foundUserData.username}</h2>
          <p className="small">{foundUserData.email}</p>
        </div>
      </div>
      <UserProfileStats userId={foundUserData.intraId} />
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
