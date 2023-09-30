import React, { useEffect } from 'react';
import UserProfileHero from '../components/UserProfile/UserProfileHero';
import CenteredLayout from '../components/UI/CenteredLayout';
import UserProfileSettings from '../components/UserProfile/UserProfileSettings';
import styled from 'styled-components';
import { useUserData } from '../context/UserDataContext';
import { useNavigate } from 'react-router-dom';
import UserDataContextData from '../interfaces/user-data-context-data.interface';

const WrapperDiv = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 60px;
`;

const UserProfile: React.FC = () => {
  const { userData }: UserDataContextData = useUserData();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) {
      navigate('/');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CenteredLayout>
      <div>
        <h1 className="title-1 mb-24">Profile</h1>
        {userData && (
          <WrapperDiv>
            <UserProfileHero userData={userData} />
            <UserProfileSettings userData={userData} />
          </WrapperDiv>
        )}
      </div>
    </CenteredLayout>
  );
};

export default UserProfile;
