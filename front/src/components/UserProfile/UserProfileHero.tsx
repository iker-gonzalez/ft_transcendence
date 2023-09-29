import React from 'react';
import styled from 'styled-components';
import ContrastPanel from '../UI/ContrastPanel';
import UserData from '../../interfaces/user-data.interface';

const WrapperDiv = styled.div`
  .avatar {
    width: 250px;
    height: 250px;
    object-fit: cover;
    object-position: center;
    border-radius: 50%;

    margin-bottom: 20px;
  }

  .username {
    font-weight: bold;
    font-size: 2rem;

    margin-bottom: 15px;
  }

  .email {
    opacity: 0.8;
    margin-bottom: 30px;
  }

  .intra-id {
    opacity: 0.8;
  }
`;

const UserProfileHero: React.FC<{ userData: UserData }> = ({ userData }) => {
  return (
    <ContrastPanel>
      <WrapperDiv>
        <img className="avatar" src={userData.avatar} alt="" />
        <p className="username">Hello, {userData.username}!</p>
        <p className="email">{userData.email}</p>
        <p className="intra-id">IntraId: {userData.intraId}</p>
        {/* TODO delete intraId, users don't really care about it */}
      </WrapperDiv>
    </ContrastPanel>
  );
};

export default UserProfileHero;
