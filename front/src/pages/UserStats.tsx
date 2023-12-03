import React, { useEffect } from 'react';
import CenteredLayout from '../components/UI/CenteredLayout';
import UserStatsInfo from '../components/shared/UserStatsInfo';
import ContrastPanel from '../components/UI/ContrastPanel';
import UserStatsMatchList from '../components/UserStats/UserStatsMatchList';
import UserDataContextData from '../interfaces/user-data-context-data.interface';
import { useUserData } from '../context/UserDataContext';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import LoadingFullscreen from '../components/UI/LoadingFullscreen';
import { sm } from '../constants/styles';

const WrapperDiv = styled.div`
  .container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: stretch;
    flex-wrap: wrap;
    gap: 40px;

    > div {
      width: 100%;
      @media (width > ${sm}) {
        min-width: 350px;
        max-width: 450px;
      }
    }
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
      <WrapperDiv>
        <CenteredLayout>
          <h1 className="title-1 mb-24">Game stats</h1>
          <div className="container">
            <ContrastPanel>
              <UserStatsInfo />
            </ContrastPanel>
            <ContrastPanel>
              <UserStatsMatchList
                userData={userData}
                numberOfItemsPerPage={4}
              />
            </ContrastPanel>
          </div>
        </CenteredLayout>
      </WrapperDiv>
    );
  }

  return <></>;
};

export default UserStats;
