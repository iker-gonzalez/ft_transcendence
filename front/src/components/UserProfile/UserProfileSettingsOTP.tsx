import React from 'react';
import MainButton from '../UI/MainButton';
import UserData from '../../interfaces/user-data.interface';

interface UserProfileSettingsOTPProps {
  userData: UserData;
}

const UserProfileSettingsOTP: React.FC<UserProfileSettingsOTPProps> = ({ userData }) => {
  return (
    <>
      <h3 className="title-3">OTP</h3>
      {userData.isTwoFactorAuthEnabled ? (
        <p>On</p>
      ) : (
        <MainButton style={{ marginLeft: '0', marginRight: 'auto' }}>Activate</MainButton>
      )}
    </>
  );
};

export default UserProfileSettingsOTP;
