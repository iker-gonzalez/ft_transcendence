import React, { useEffect, useState } from 'react';
import UserProfileHero from '../components/UserProfile/UserProfileHero';
import CenteredLayout from '../components/UI/CenteredLayout';
import UserProfileSettings from '../components/UserProfile/UserProfileSettings';
import styled from 'styled-components';
import { useUserData } from '../context/UserDataContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import UserDataContextData from '../interfaces/user-data-context-data.interface';
import UserProfileWelcomeModal from '../components/UserProfile/UserProfileWelcomeModal';
import UserProfileFriends from '../components/UserProfile/UserProfileFriends';
import UserProfileGame from '../components/UserProfile/UserProfileGame';

const WrapperDiv = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 60px;

  .blocks-container {
    display: flex;
    flex-direction: column;
    gap: 25px;
  }
`;

const UserProfile: React.FC = () => {
  const { userData }: UserDataContextData = useUserData();
  let [searchParams] = useSearchParams();
  const [showNewUserModal, setShowNewUserModal] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) {
      navigate('/');
    }

    const isNewUser: boolean = searchParams.has('welcome');
    if (isNewUser) {
      setShowNewUserModal(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <CenteredLayout>
        <div>
          <h1 className="title-1 mb-24">Profile</h1>
          {userData && (
            <WrapperDiv>
              <UserProfileHero userData={userData} />
              <div className="blocks-container">
                <UserProfileSettings userData={userData} />
                <UserProfileFriends />
                <UserProfileGame userData={userData} />
              </div>
            </WrapperDiv>
          )}
        </div>
      </CenteredLayout>
      {showNewUserModal && (
        <UserProfileWelcomeModal
          setShowNewUserModal={setShowNewUserModal}
          username={userData?.username}
        />
      )}
    </>
  );
};

export default UserProfile;
