import React, { useEffect, useState } from 'react';
import UserProfileHero from '../components/UserProfile/UserProfileHero';
import CenteredLayout from '../components/UI/CenteredLayout';
import UserProfileSettings from '../components/UserProfile/UserProfileSettings';
import styled from 'styled-components';
import { useUserData } from '../context/UserDataContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import UserDataContextData from '../interfaces/user-data-context-data.interface';
import Modal from '../components/UI/Modal';
import MainButton from '../components/UI/MainButton';

const WrapperDiv = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 60px;
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
              <UserProfileSettings userData={userData} />
            </WrapperDiv>
          )}
        </div>
      </CenteredLayout>
      {showNewUserModal && (
        <Modal
          dismissModalAction={() => {
            setShowNewUserModal(false);
          }}
        >
          <h2 className="title-1 mb-24">
            Hello, {userData?.username ?? 'stranger'}!
          </h2>
          <p className="mb-16">We're happy to see you here 😍</p>
          <p className="mb-24">
            This is your profile page. We grabbed your profile picture and
            username from the 42 Intra API, but feel free to change them if you
            prefer.
          </p>
          <MainButton
            onClick={() => {
              setShowNewUserModal(false);
            }}
          >
            Continue
          </MainButton>
        </Modal>
      )}
    </>
  );
};

export default UserProfile;
