import React from 'react';
import UserProfileHero from '../components/UserProfileHero';
import CenteredLayout from '../components/UI/CenteredLayout';
import UserProfileSettings from '../components/UserProfileSettings';
import styled from 'styled-components';
import { useUserData } from '../context/UserDataContext';

const WrapperDiv = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 60px;
`;

const UserProfile: React.FC = () => {
  const { userData } = useUserData();

  if (!userData) {
    // Display an error message if the data couldn't be fetched
    return <div>Error fetching user data.</div>;
  }

  return (
    <CenteredLayout>
      {userData && (
        <WrapperDiv>
          <UserProfileHero userData={userData} />
          <UserProfileSettings userData={userData} />
        </WrapperDiv>
      )}
    </CenteredLayout>
  );
};

export default UserProfile;
