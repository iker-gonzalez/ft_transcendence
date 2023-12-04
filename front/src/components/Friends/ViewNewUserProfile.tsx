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
import UserStatsInfo from '../shared/UserStatsInfo';
import UserStatsMatchList from '../UserStats/UserStatsMatchList';
import { darkBgColor } from '../../constants/color-tokens';
import ContrastPanel from '../UI/ContrastPanel';

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
  .header-container {
    max-width: 550px;
    margin: 0 auto;

    display: flex;
    justify-content: center;
    align-items: center;
    gap: 50px;
  }

  .user-info-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;

    .avatar {
      width: 125px;
    }
  }

  .actions-container {
    white-space: nowrap;
  }

  .user-data-container {
    display: flex;
    justify-content: center;
    align-items: stretch;
    gap: 50px;
  }
`;

type ViewNewUserProfileProps = {
  foundUserData: UserCoreData;
  isAlreadyFriend?: boolean;
  shouldHideFriendCta?: boolean;
  onUpdateFriendsList: (
    friendsList: FriendData[],
    successMessage: string,
  ) => void;
};

const ViewNewUserProfile: React.FC<ViewNewUserProfileProps> = ({
  foundUserData,
  isAlreadyFriend,
  shouldHideFriendCta,
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
      <div className="header-container">
        <div className="user-info-container mb-24">
          <RoundImg src={foundUserData.avatar} alt="" className="avatar" />
          <div>
            <h2 className="title-2 mb-8">{foundUserData.username}</h2>
            <p className="small">{foundUserData.email}</p>
          </div>
        </div>
        {!shouldHideFriendCta && (
          <div className="actions-container">
            {isAlreadyFriend ? (
              <SecondaryButton onClick={removeUserFromFriends}>
                Unfriend 💔
              </SecondaryButton>
            ) : (
              <MainButton onClick={addUserToFriend}>Add to friends</MainButton>
            )}
          </div>
        )}
      </div>

      <div className="user-data-container">
        <ContrastPanel $backgroundColor={darkBgColor}>
          <UserStatsInfo userId={foundUserData.intraId} />
        </ContrastPanel>
        <ContrastPanel $backgroundColor={darkBgColor}>
          <UserStatsMatchList
            userData={foundUserData}
            numberOfItemsPerPage={3}
          />
        </ContrastPanel>
      </div>
    </WrapperDiv>
  );
};

export default ViewNewUserProfile;
