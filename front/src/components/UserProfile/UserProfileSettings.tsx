import React from 'react';
import styled from 'styled-components';
import ContrastPanel from '../UI/ContrastPanel';
import { primaryLightColor } from '../../constants/color-tokens';
import UserData from '../../interfaces/user-data.interface';
import UserProfileSettingsUsername from './UserProfileSettingsUsername';
import UserProfileSettingsOTP from './UserProfileSettingsOTP';

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
        <h2 className="title-2 mb-24">Settings</h2>
        <UserProfileSettingsOTP userData={userData} className="settings-item" />
        <UserProfileSettingsUsername className="settings-item" />
      </WrapperDiv>
    </ContrastPanel>
  );
};

export default UserProfileSettings;
