import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainButton from '../components/UI/MainButton';
import { styled } from 'styled-components';
import CenteredLayout from './UI/CenteredLayout';
import { primaryAccentColor } from '../constants/color-tokens';

const WrapperDiv = styled.div`
  .highlighted {
    color: ${primaryAccentColor};
    font-weight: bold;
  }

  .user-info-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 100px;
    grid-gap: 20px;

    margin-top: 20px;
    margin-bottom: 20px;
  }

  .user-info-box {
    width: 300px;
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px ${primaryAccentColor} solid;
    border-radius: 20px;
  }

  .warning-box {
    margin-top: 50px;
  }
`;

export default function GameIndex() {
  const navigate = useNavigate();

  const onGoToGameQueue = () => {
    navigate('queue');
  };

  return (
    <WrapperDiv>
      <CenteredLayout>
        <h1>Game dashboard</h1>
        <p>
          This is the content of the page that is shown when you first access
          the <span className="highlighted">game</span> route
        </p>
        <div className="user-info-container">
          <div className="user-info-box">
            <p>Online friends?</p>
          </div>
          <div className="user-info-box">
            <p>User stats?</p>
          </div>
        </div>
        <MainButton onClick={onGoToGameQueue}>Go to matchmaking</MainButton>
        <div className="warning-box">
          <p>
            ℹ️ If you want to simulate a match with two players, you first have
            to{' '}
            <Link to="/" className="highlighted">
              log in
            </Link>{' '}
            with our test users (<span className="highlighted">123456</span> and{' '}
            <span className="highlighted">111111</span>) ℹ️
          </p>
        </div>
      </CenteredLayout>
    </WrapperDiv>
  );
}
