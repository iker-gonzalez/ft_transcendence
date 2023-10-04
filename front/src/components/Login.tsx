import React, { useEffect, useState } from 'react';
import { getBaseUrl } from '../utils/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import UserProfile from '../pages/UserProfile';
import LoadingPage from '../pages/LoadingPage';
import { useUserData } from '../context/UserDataContext';
import moment from 'moment';
import Cookies from 'js-cookie';

const Login: React.FC = (): JSX.Element => {
  const { setUserData } = useUserData();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // You can directly access the code from the URL query parameter here
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    console.log('code:', code);

    if (code) {
      setIsLoading(true); // Set loading state to true

      // Make the POST request with the captured code
      fetch(`${getBaseUrl()}/auth/intra/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
        },
        body: JSON.stringify({
          code, // Use the captured code from the URL
          state: process.env.REACT_APP_INTRA_STATE,
        }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('An error occurred on the server.');
          }
        })
        .then((data) => {
          setUserData(data.data); // Set the user data in the global state

          // TODO set expiration synched with BE through env var
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
          // Handle the error and set a message if needed
        })
        .finally(() => {
          if (isLoading === true) navigate('/'); // Redirect to the home page if the request is done
          setIsLoading(false); // Set loading state to false when the request is done
        });
    }
  }, [navigate, location]);

  return <>{isLoading && <LoadingPage />}</>;
};

export default Login;
