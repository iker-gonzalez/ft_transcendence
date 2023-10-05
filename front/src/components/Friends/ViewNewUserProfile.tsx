import React, { useState } from 'react';
import styled from 'styled-components';
import UserCoreData from '../../interfaces/user-core-data.interface';
import RoundImg from '../UI/RoundImage';
import MainButton from '../UI/MainButton';
import SecondaryButton from '../UI/SecondaryButton';
import { getBaseUrl } from '../../utils/utils';
import Cookies from 'js-cookie';
import FlashMessage from '../UI/FlashMessage';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';

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
};

const ViewNewUserProfile: React.FC<ViewNewUserProfileProps> = ({
  foundUserData,
  isAlreadyFriend,
}): JSX.Element => {
  const [successMessage, setSuccessMessage] = useState<string>('');

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
      setSuccessMessage(`${foundUserData!.username} was added to friends!`);
    }

    console.log('data', data);
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
      setSuccessMessage(
        `${foundUserData!.username} was removed from your friends!`,
      );
    }
  };

  return (
    <>
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
      {!!successMessage.length && (
        <FlashMessage text={successMessage} level={FlashMessageLevel.SUCCESS} />
      )}
    </>
  );
};

export default ViewNewUserProfile;
