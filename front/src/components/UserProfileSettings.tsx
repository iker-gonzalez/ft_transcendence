import React from 'react';
import styled from 'styled-components';
import ContrastPanel from './UI/ContrastPanel';
import MainButton from './UI/MainButton';
import { primaryLightColor } from '../constants/color-tokens';
import UserData from '../interfaces/user-data.interface';
import UserProfileSettingsUsername from './UperProfileSettingsUsername';

const WrapperDiv = styled.div`
  width: 650px;

  .settings-item {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:not(:last-of-type) {
      padding-bottom: 20px;
      margin-bottom: 20px;
      border-bottom: 1px ${primaryLightColor} solid;
    }

    > p {
      margin: 0;
    }
  }
`;

const UserProfileSettings: React.FC<{ userData: UserData }> = ({
  userData,
}) => {
  return (
    <ContrastPanel>
      <WrapperDiv>
        <div className="settings-item">
          <p className="title-3">OTP</p>
          {userData.isTwoFactorAuthEnabled ? (
            <p>On</p>
          ) : (
            <MainButton>Activate</MainButton>
          )}
        </div>
        <UserProfileSettingsUsername className="settings-item" />
      </WrapperDiv>
    </ContrastPanel>
  );
};

export default UserProfileSettings;
