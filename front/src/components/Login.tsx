import React, { useEffect, useState } from 'react';
import { getBaseUrl } from '../utils/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingFullscreen from './UI/LoadingFullscreen';
import { useUserData } from '../context/UserDataContext';
import moment from 'moment';
import Cookies from 'js-cookie';
import { useFlashMessages } from '../context/FlashMessagesContext';
import FlashMessageLevel from '../interfaces/flash-message-color.interface';

const Login: React.FC = (): JSX.Element => {
  const { setUserData } = useUserData();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { launchFlashMessage } = useFlashMessages();

  useEffect(() => {
    // You can directly access the code from the URL query parameter here
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');

    if (code) {
      setIsLoading(true); // Set loading state to true

      // Make the POST request with the captured code
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

          // Set token in cookies with same expiration date as in the API
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
          navigate('/');
          launchFlashMessage(
            'It is not possible to log in with the Intra right now 😬',
            FlashMessageLevel.ERROR,
          );
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [navigate, location, setUserData, launchFlashMessage]);

  return <>{isLoading && <LoadingFullscreen />}</>;
};

export default Login;
