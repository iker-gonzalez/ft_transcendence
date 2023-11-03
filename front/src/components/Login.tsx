import React, { useEffect, useState } from 'react';
import { getBaseUrl } from '../utils/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingFullscreen from './UI/LoadingFullscreen';
import { useUserData } from '../context/UserDataContext';
import moment from 'moment';
import Cookies from 'js-cookie';
import Modal from './UI/Modal';
import MainButton from './UI/MainButton';
import FlashMessageLevel from '../interfaces/flash-message-color.interface';
import { useFlashMessages } from '../context/FlashMessagesContext';

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

          const isNewUser: boolean = data.created === 1;
          if (isNewUser) {
            navigate('/profile?welcome');
          } else {
            navigate('/game');
          }
        })
        .catch((error) => {
          if (error.status === 401) {
            launchFlashMessage(
              'OTP code invalid. Please try again.',
              FlashMessageLevel.ERROR,
            );
          }
          setUserData(null);
          setShowModal(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [navigate, location, setUserData]); // Include otpValue in the dependency array

  // Function to handle changes in the OTP input
  const handleOtpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtpValue(e.target.value);
  };

  return (
    <>
      {showModal && (
        <Modal dismissModalAction={() => setShowModal(false)}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otpValue}
            onChange={handleOtpInputChange} // Handle OTP input changes
          />
          <MainButton
            style={{ marginLeft: 'auto', marginRight: 'auto', marginTop: '50px' }}
            onClick={handleActivateWithOTP}
          >
            Sign In
          </MainButton>
        </Modal>
      )}
    </>
  );
};

export default Login;

