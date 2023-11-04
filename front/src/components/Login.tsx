import React, { useEffect, useState } from 'react';
import { getBaseUrl } from '../utils/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserData } from '../context/UserDataContext';
import moment from 'moment';
import Cookies from 'js-cookie';
import Modal from './UI/Modal';
import MainButton from './UI/MainButton';
import FlashMessageLevel from '../interfaces/flash-message-color.interface';
import { useFlashMessages } from '../context/FlashMessagesContext';
import MainInput from './UI/MainInput';
import styled from 'styled-components';
import Lottie from 'lottie-react';
import OtpAnimationData from '../assets/lotties/otp.json';
import { INVALID_OTP_ERROR, OTP_LENGTH } from '../constants/shared';
import LoadingFullscreen from './UI/LoadingFullscreen';

const OtpModal = styled(Modal)`
  .action-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }

  .otp-lottie {
    width: 350px;
    height: 100%;
    object-fit: contain;
  }
`;

const Login: React.FC = (): JSX.Element => {
  const { setUserData } = useUserData();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [otpValue, setOtpValue] = useState(''); // Initialize the state with an empty string
  const { launchFlashMessage } = useFlashMessages();

  const handleActivateWithOTP = () => {
    console.log(otpValue);
    sessionStorage.setItem('otpValue', otpValue);
    // Get the otpValue from the state
    if (otpValue) {
      window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.REACT_APP_INTRA_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_INTRA_AUTH_REDIRECT_URI}&response_type=code&otp=${otpValue}`;
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const otpValue = sessionStorage.getItem('otpValue');
    if (code) {
      setIsLoading(true);
      interface RequestBody {
        code: string;
        state: string | undefined;
        otp?: string;
      }

      const requestBody: RequestBody = {
        code,
        state: process.env.REACT_APP_INTRA_STATE,
      };

      if (otpValue) {
        requestBody.otp = otpValue;
      }
      setIsLoading(true);
      fetch(`${getBaseUrl()}/auth/intra/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
        .then((response) => {
          if (response.status === 401) throw new Error(INVALID_OTP_ERROR);

          if (response.ok) {
            return response.json();
          }
        })
        .then((data) => {
          setUserData(data.data);

          const tokenExpirationDate = moment()
            .add(process.env.REACT_APP_JWT_EXPIRATION_MINUTES, 'minutes')
            .toDate();

          Cookies.set('token', data.access_token, {
            expires: tokenExpirationDate,
          });

          // Remove the otpValue from the session storage
          sessionStorage.removeItem('otpValue');

          const isNewUser: boolean = data.created === 1;
          if (isNewUser) {
            navigate('/profile?welcome');
          } else {
            navigate('/game');
          }
        })
        .catch((error) => {
          if (error.message === INVALID_OTP_ERROR) {
            setShowModal(true);
          } else {
            setUserData(null);
            launchFlashMessage('Failed to sign in.', FlashMessageLevel.ERROR);
            navigate('/');
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [navigate, location, setUserData, launchFlashMessage]);

  // Function to handle changes in the OTP input
  const handleOtpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtpValue(e.target.value);
  };

  return (
    <>
      {isLoading && !showModal && <LoadingFullscreen />}
      {showModal && (
        <OtpModal
          dismissModalAction={() => {
            setShowModal(false);
            navigate('/');
          }}
        >
          <h1 className="title-2 mb-24">Insert OTP</h1>
          <p>Take out your phone and input an OTP to sign in.</p>
          <Lottie
            animationData={OtpAnimationData}
            className="otp-lottie"
            loop={false}
          />
          <div className="action-container">
            <MainInput
              type="text"
              placeholder="Enter OTP"
              maxLength={OTP_LENGTH}
              value={otpValue}
              onChange={handleOtpInputChange} // Handle OTP input changes
            />
            <MainButton onClick={handleActivateWithOTP}>Sign In</MainButton>
          </div>
        </OtpModal>
      )}
    </>
  );
};

export default Login;
