import React, { useEffect, useState } from 'react';
import { getUrlWithRelativePath } from '../utils/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import UserProfile from '../pages/UserProfile';
import LoadingPage from '../pages/LoadingPage';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // You can directly access the code from the URL query parameter here
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");
    console.log('code:', code);

    if (code) {
      setIsLoading(true); // Set loading state to true

      // Make the POST request with the captured code
      fetch(`${getUrlWithRelativePath("auth/intra/signin")}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authentication headers if needed
        },
        body: JSON.stringify({
          code: 111111, // Use the captured code from the URL
          state: "oI7a4edGeu8kamVFhYkJqF2EWu2zFk9A",
        }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("An error occurred on the server.");
          }
        })
        .then((data) => {
          sessionStorage.setItem("intraId", data.data.intraId);
          navigate('/profile'); // Redirect to the "/profile" route
        })
        .catch((error) => {
          console.error('An error occurred:', error);
          // Handle the error and set a message if needed
        })
        .finally(() => {
          setIsLoading(false); // Set loading state to false when the request is done
        });
    }
  }, [navigate, location]);

  return (
    // Render either the loading page or user profile content based on isLoading state
    <div>
      {isLoading ? <LoadingPage targetPath="/profile" /> : <UserProfile />}
    </div>
  );
}

export default Login;
