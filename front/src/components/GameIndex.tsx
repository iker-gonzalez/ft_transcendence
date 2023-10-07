import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainButton from '../components/UI/MainButton';
import { styled } from 'styled-components';
import CenteredLayout from './UI/CenteredLayout';
import ContrastPanel from './UI/ContrastPanel';

const WrapperDiv = styled.div`
  .user-info-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 100px;
    grid-gap: 20px;

    margin-bottom: 20px;
  }

  .user-info-box {
    width: 300px;
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 20px;
  }

  .warning-box {
    margin-top: 50px;
  }
`;

export default function GameIndex(): JSX.Element {
  const navigate = useNavigate();

  const onGoToGameQueue = () => {
    navigate('queue');
  };

  return (
    <WrapperDiv>
      <CenteredLayout>
        <h1 className="title-1">Game dashboard</h1>
        <div className="user-info-container">
          <ContrastPanel className="user-info-box">
            <p>Online friends?</p>
          </ContrastPanel>
          <ContrastPanel className="user-info-box">
            <p>User stats?</p>
          </ContrastPanel>
        </div>
        <MainButton onClick={onGoToGameQueue}>Go to matchmaking</MainButton>
        <div className="warning-box">
          <p>
            ℹ️ If you want to simulate a match with two players, you first have
            to{' '}
            <Link to="/" className="body-link">
              log in
            </Link>{' '}
            ℹ️
          </p>
        </div>
      </CenteredLayout>
    </WrapperDiv>
  );
}
