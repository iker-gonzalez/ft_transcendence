import React, { useEffect } from 'react';
import CenteredLayout from '../components/UI/CenteredLayout';
import UserStatsStats from '../components/UserStats/UserStatsStats';
import ContrastPanel from '../components/UI/ContrastPanel';
import UserStatsMatchList from '../components/UserStats/UserStatsMatchList';
import UserDataContextData from '../interfaces/user-data-context-data.interface';
import { useUserData } from '../context/UserDataContext';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import LoadingFullscreen from '../components/UI/LoadingFullscreen';

const WrapperDiv = styled.div`
  .container {
    display: flex;
    justify-content: center;
    align-items: stretch;
    gap: 40px;
  }

  .stats-container {
    max-width: 400px;
  }
`;

const UserStats: React.FC = (): JSX.Element => {
  const { userData, fetchUserData, isUserDataFetching }: UserDataContextData =
    useUserData();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) {
      const token = Cookies.get('token');

      if (!token) {
        navigate('/');
        return;
      }

      fetchUserData(token);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isUserDataFetching) {
    return <LoadingFullscreen />;
  }

  if (userData) {
    return (
      <CenteredLayout>
        <WrapperDiv>
          <h1 className="title-1 mb-24">Game dashboard</h1>
          <div className="container">
            <ContrastPanel className="stats-container">
              <UserStatsStats />
            </ContrastPanel>
            <ContrastPanel>
              <UserStatsMatchList
                userData={userData}
                numberOfItemsPerPage={4}
              />
            </ContrastPanel>
          </div>
        </WrapperDiv>
      </CenteredLayout>
    );
  }

  return <></>;
};

export default UserStats;
