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
import { sm } from '../constants/styles';

const WrapperDiv = styled.div`
  width: 100%;

  .content {
    display: flex;
    align-items: stretch;
    justify-content: center;
    flex-wrap: wrap;
    gap: 40px;
  }

  .title {
    margin-right: auto;
  }

  .blocks-container {
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    gap: 25px;

    &:first-of-type {
      @media (width > ${sm}) {
        width: 350px;
      }
    }

    &:last-of-type {
      flex: 1;

      > * {
        flex: 1;
      }
    }

    > * {
      width: 100%;
    }
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
        <WrapperDiv>
          <h1 className="title title-1 mb-24">Profile</h1>
          <div className="content">
            {userData && (
              <>
                <div className="blocks-container">
                  <UserProfileHero userData={userData} />
                </div>
                <div className="blocks-container">
                  <UserProfileSettings userData={userData} />
                  <UserProfileFriends />
                </div>
              </>
            )}
          </div>
        </WrapperDiv>
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
