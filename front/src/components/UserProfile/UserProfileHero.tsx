import React from 'react';
import styled from 'styled-components';
import ContrastPanel from '../UI/ContrastPanel';
import UserData from '../../interfaces/user-data.interface';
import UserProfileSettingsAvatar from './UserProfileSettingsAvatar';

const WrapperDiv = styled.div`
  .avatar-container {
    position: relative;
    margin-bottom: 20px;

    display: flex;
    justify-content: center;
    align-items: center;

    .avatar {
      width: 250px;
      height: 250px;

      object-fit: cover;
      object-position: center;
      border-radius: 50%;
    }

    .avatar-change-btn {
      position: absolute;
      bottom: 20px;
      right: 45px;
    }
  }

  .email {
    opacity: 0.8;
  }
`;

const UserProfileHero: React.FC<{ userData: UserData }> = ({
  userData,
}): JSX.Element => {
  return (
    <ContrastPanel>
      <WrapperDiv>
        <h2 className="sr-only">Personal info</h2>
        <div className="avatar-container">
          <img className="avatar" src={userData.avatar} alt="" />
          <UserProfileSettingsAvatar
            className="settings-item avatar-change-btn"
            userData={userData}
          />
        </div>
        <h3 className="title-1 mb-16">Hello, {userData.username}!</h3>
        <p className="email mb-24">{userData.email}</p>
        <p className="small">IntraId: {userData.intraId}</p>
        {/* TODO delete intraId, users don't really care about it */}
      </WrapperDiv>
    </ContrastPanel>
  );
};

export default UserProfileHero;
