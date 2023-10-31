import React, { useEffect, useState } from 'react';
import { getBaseUrl } from '../utils/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingPage from '../pages/LoadingPage';
import { useUserData } from '../context/UserDataContext';
import moment from 'moment';
import Cookies from 'js-cookie';
import Modal from './UI/Modal';
import MainButton from './UI/MainButton';

const Login: React.FC = (): JSX.Element => {
  const { setUserData } = useUserData();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [otpValue, setOtpValue] = useState('');

  const handleActivateWithOTP = () => {
    if (otpValue) {
      console.log('OTP: ', otpValue);
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');

      setIsLoading(true);

      fetch(`${getBaseUrl()}/auth/intra/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          otp: otpValue, // Use the otpValue state
          state: process.env.REACT_APP_INTRA_STATE,
        }),
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
          console.error('An error occurred:', error);
          setUserData(null);

          setShowModal(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');

    if (code) {
      setIsLoading(true);

      fetch(`${getBaseUrl()}/auth/intra/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          state: process.env.REACT_APP_INTRA_STATE,
        }),
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
          console.error('An error occurred:', error);
          setUserData(null);

          setShowModal(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [navigate, location, setUserData]);

  return (
    <>
      {isLoading && <LoadingPage />}
      {showModal && (
        <Modal dismissModalAction={() => setShowModal(false)}>
          {qrCode ? (
            <img src={qrCode} alt="QR Code" />
          ) : null}
          <input
            type="text"
            placeholder="Enter OTP"
            value={otpValue}
            onChange={(e) => setOtpValue(e.target.value)}
          />
          <MainButton
            style={{ marginLeft: '0', marginRight: 'auto' }}
            onClick={handleActivateWithOTP}
          >
            Activate
          </MainButton>
        </Modal>
      )}
    </>
  );
};

export default Login;
