import React, { useState, useEffect } from 'react';
import MainButton from '../UI/MainButton';
import UserData from '../../interfaces/user-data.interface';
import Cookies from 'js-cookie';
import { fetchAuthorized, getBaseUrl } from '../../utils/utils';
import Modal from '../UI/Modal';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import { useFlashMessages } from '../../context/FlashMessagesContext';
import MainInput from '../UI/MainInput';
import styled from 'styled-components';
import { primaryAccentColor } from '../../constants/color-tokens';
import { OTP_LENGTH } from '../../constants/shared';
import Checkmark from '../../assets/svg/checkmark.svg';
import SVG from 'react-inlinesvg';

interface UserProfileSettingsOTPProps {
  userData: UserData;
  className?: string;
}

const WrapperDiv = styled.div`
  .checkmark-icon {
    width: 30px;
    height: auto;
    object-fit: contain;
  }
`;

const OtpModal = styled(Modal)`
  .qr-container {
    max-width: 350px;

    img {
      width: 200px;
      aspect-ratio: 1/1;
      border: 4px ${primaryAccentColor} solid;
      border-radius: 20px;
      margin-bottom: 16px;
    }
  }

  .otp-input-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }
`;

const UserProfileSettingsOTP: React.FC<UserProfileSettingsOTPProps> = ({
  userData,
  className,
}) => {
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [is2FAOn, set2FAOn] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null); // State to store the QR code image URL
  const [otpValue, setOtpValue] = useState(''); // State to store OTP input value
  const { launchFlashMessage } = useFlashMessages();

  useEffect(() => {
    if (isGeneratingQR) {
      generateQRCode();
    }
  }, [isGeneratingQR]);

  const generateQRCode = async () => {
    try {
      const response = await fetchAuthorized(`${getBaseUrl()}/2fa/generate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });

      if (response.ok) {
        // Assuming the response is an image
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setQrCode(imageUrl);
        setIsGeneratingQR(false);
        setIsActivating(true);
      } else {
        console.error('Failed to generate QR code');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleActivate = () => {
    setIsGeneratingQR(true);
  };

  const handleActivateWithOTP = async () => {
    try {
      // Make a POST request to the /2fa/activate endpoint with the OTP value.
      const response = await fetchAuthorized(`${getBaseUrl()}/2fa/activate`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
        body: JSON.stringify({ otp: otpValue }), // Pass the OTP value from state
      });

      if (response.ok) {
        console.log('2FA activated');
        setIsActivating(false);
        set2FAOn(true);
        launchFlashMessage(
          '2FA activated successfully',
          FlashMessageLevel.SUCCESS,
        );
      } else {
        console.error('Failed to activate 2FA.');
        launchFlashMessage('Failed to activate 2FA.', FlashMessageLevel.ERROR);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      <WrapperDiv className={className}>
        <h3 className="title-3">OTP</h3>
        {userData.isTwoFactorAuthEnabled || is2FAOn ? (
          <SVG src={Checkmark} title="activated" className="checkmark-icon" />
        ) : (
          <MainButton onClick={handleActivate}>Activate</MainButton>
        )}
      </WrapperDiv>
      {isActivating && (
        <OtpModal
          dismissModalAction={() => {
            setIsActivating(false);
          }}
          className="qr-modal"
        >
          {qrCode && (
            <>
              <div className="qr-container mb-24">
                <h1 className="title-1 mb-24">Scan this QR code</h1>
                <img src={qrCode} alt="QR Code" />
                <p>
                  Use your preferred authenticator app and insert your first OTP
                  below.
                </p>
              </div>
              <div className="otp-input-container">
                <MainInput
                  type="text"
                  maxLength={OTP_LENGTH}
                  placeholder="Enter OTP"
                  value={otpValue} // Bind input value to state
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.match(/^[0-9]*$/)) {
                      setOtpValue(value);
                    }
                  }} // Update state on input change
                />
                <MainButton
                  onClick={handleActivateWithOTP}
                  disabled={otpValue.length !== OTP_LENGTH}
                >
                  Activate
                </MainButton>
              </div>
            </>
          )}
        </OtpModal>
      )}
    </>
  );
};

export default UserProfileSettingsOTP;
