import React, { useState, useEffect } from 'react';
import MainButton from '../UI/MainButton';
import UserData from '../../interfaces/user-data.interface';
import Cookies from 'js-cookie';
import { fetchAuthorized, getBaseUrl } from '../../utils/utils';
import Modal from '../UI/Modal';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import { useFlashMessages } from '../../context/FlashMessagesContext';
import styled from 'styled-components';
import { primaryAccentColor } from '../../constants/color-tokens';
import OtpSubmitForm from '../shared/OtpSubmitForm';
import SecondaryButton from '../UI/SecondaryButton';

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
`;

const UserProfileSettingsOTP: React.FC<UserProfileSettingsOTPProps> = ({
  userData,
  className,
}) => {
  const [isTestUser, setIsTestUser] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [is2FAOn, set2FAOn] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null); // State to store the QR code image URL
  const [otpValue, setOtpValue] = useState(''); // State to store OTP input value
  const { launchFlashMessage } = useFlashMessages();

  useEffect(() => {
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
          console.error('Failed to generate QR code.');
          if (response.status === 422) {
            setIsTestUser(true);
            launchFlashMessage(
              '2FA is not available for test users.',
              FlashMessageLevel.ERROR,
            );
          }
        }
      } catch (error) {
        console.log('ciao');
        console.error('Error:', error);
      }
    };

    if (isGeneratingQR) {
      generateQRCode();
    }
  }, [isGeneratingQR, launchFlashMessage]);

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
        setIsActivating(false);
        launchFlashMessage(
          'Failed to activate 2FA. Try again.',
          FlashMessageLevel.ERROR,
        );
        setOtpValue('');
      }
    } catch (error: any) {
      console.error('Error:', error);
    }
  };

  const handleDeactivateWithOtp = async () => {
    try {
      // Make a POST request to the /2fa/activate endpoint with the OTP value.
      const response = await fetchAuthorized(`${getBaseUrl()}/2fa/deactivate`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
        body: JSON.stringify({ otp: otpValue }),
      });

      if (response.ok) {
        console.log('2FA deactivated');
        setIsDeactivating(false);
        set2FAOn(false);
        launchFlashMessage(
          '2FA deactivated successfully',
          FlashMessageLevel.SUCCESS,
        );
      } else {
        console.error('Failed to deactivate 2FA.');
        launchFlashMessage(
          'Failed to deactivate 2FA. Try again.',
          FlashMessageLevel.ERROR,
        );
        setOtpValue('');
      }
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setOtpValue('');
    }
  };

  return (
    <>
      <WrapperDiv className={className}>
        <h3 className="title-3">OTP</h3>
        {userData.isTwoFactorAuthEnabled || is2FAOn ? (
          <SecondaryButton
            onClick={() => {
              setIsDeactivating(true);
            }}
            disabled={isTestUser}
          >
            Deactivate
          </SecondaryButton>
        ) : (
          <MainButton
            onClick={() => {
              setIsGeneratingQR(true);
            }}
            disabled={isTestUser}
          >
            Activate
          </MainButton>
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
              <OtpSubmitForm
                otpValue={otpValue}
                setOtpValue={setOtpValue}
                handleActivateWithOTP={handleActivateWithOTP}
              />
            </>
          )}
        </OtpModal>
      )}
      {isDeactivating && (
        <OtpModal
          dismissModalAction={() => {
            setIsDeactivating(false);
          }}
          className="qr-modal"
        >
          <div className="qr-container mb-24">
            <h1 className="title-1 mb-24">Deactivate OTP</h1>
            <p>
              Deactivating OTP on your profile makes your account less secure.
              If you are sure you want to proceed, insert your OTP below.
            </p>
          </div>
          <OtpSubmitForm
            otpValue={otpValue}
            setOtpValue={setOtpValue}
            handleActivateWithOTP={handleDeactivateWithOtp}
            calloutText="Deactivate"
          />
        </OtpModal>
      )}
    </>
  );
};

export default UserProfileSettingsOTP;
