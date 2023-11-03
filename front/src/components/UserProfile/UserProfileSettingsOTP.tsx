import React, { useState, useEffect } from 'react';
import MainButton from '../UI/MainButton';
import UserData from '../../interfaces/user-data.interface';
import Cookies from 'js-cookie';
import { fetchAuthorized, getBaseUrl } from '../../utils/utils';
import Modal from '../UI/Modal';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import { useFlashMessages } from '../../context/FlashMessagesContext';

interface UserProfileSettingsOTPProps {
  userData: UserData;
}

const UserProfileSettingsOTP: React.FC<UserProfileSettingsOTPProps> = ({ userData }) => {
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
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('token')}`,
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
        launchFlashMessage(
          'Failed to activate 2FA.',
          FlashMessageLevel.ERROR,
        );
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      <h3 className="title-3">OTP</h3>
      {userData.isTwoFactorAuthEnabled || is2FAOn ? (
        <p style={{ marginLeft: 'auto', marginRight: '0', fontSize: '28px', color: 'yellow'}}>On</p>
      ) : (
        isGeneratingQR ? (
          <p>Generating QR code...</p>
        ) : isActivating ? (
          <Modal dismissModalAction={() => {setIsActivating(false)}} >
            {qrCode ? (
              <img src={qrCode} alt="QR Code" />
            ) : null}
            <input
              style={{ marginLeft: 'auto', marginRight: 'auto' , marginTop: '20px'}}
              type="text"
              placeholder="Enter OTP"
              value={otpValue} // Bind input value to state
              onChange={(e) => setOtpValue(e.target.value)} // Update state on input change
            />
            <MainButton
              style={{ marginLeft: 'auto', marginRight: 'auto' , marginTop: '30px'}}
              onClick={handleActivateWithOTP}
            >
              Activate
            </MainButton>
          </Modal>
        ) : (
          <MainButton
            style={{ marginLeft: 'auto', marginRight: '0' }}
            onClick={handleActivate}
          >
            Activate
          </MainButton>
        )
      )}
    </>
  );
};

export default UserProfileSettingsOTP;