import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { primaryAccentColor } from '../constants/color-tokens';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Spinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid ${primaryAccentColor}; /* Change the spinner color */
  width: 50px;
  height: 50px;
  animation: ${spin} 1s linear infinite;
`;

interface LoadingPageProps {
  targetPath: string;
}

function LoadingPage({ targetPath }: LoadingPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Simulate an asynchronous operation, like fetching data
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false); // Set isLoading to false after a delay (simulating data loading)

      // Navigate to the specified target path when loading is complete
      navigate(targetPath);
    }, 1000); // Adjust the delay as needed
  }, [navigate, targetPath]);

  return (
    <div>
      {
        isLoading ? (
          <LoadingSpinner>
            <Spinner />
          </LoadingSpinner>
        ) : null /* No content to display */
      }
    </div>
  );
}

export default LoadingPage;
