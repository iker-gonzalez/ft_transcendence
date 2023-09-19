import React from 'react';
import styled from 'styled-components';
import ContrastPanel from './UI/ContrastPanel';

const WrapperDiv = styled.div`
  padding: 60px 100px;

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

// TODO add TS interface for userData
const UserProfileHero: React.FC<{ userData: any }> = ({ userData }) => {
  return (
    <WrapperDiv>
      <ContrastPanel>
        <img className="avatar" src={userData.avatar} alt="" />
        <p className="username">Hello, {userData.username}!</p>
        <p className="email">{userData.email}</p>
        <p className="intra-id">IntraId: {userData.intraId}</p>
        {/* TODO delete intraId, users don't really care about it */}
      </ContrastPanel>
    </WrapperDiv>
  );
};

export default UserProfileHero;
