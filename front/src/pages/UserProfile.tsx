import React, { useEffect, useState } from 'react';
import { getBaseUrl } from '../utils/utils';
import UserProfileHero from '../components/UserProfileHero';
import CenteredLayout from '../components/UI/CenteredLayout';
import UserProfileSettings from '../components/UserProfileSettings';
import styled from 'styled-components';

const WrapperDiv = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 60px;
`;

const UserProfile: React.FC<{ userData: UserData | null }> = ({ userData }) => {
  // const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `${getBaseUrl()}/users/me`;
        const response = await fetch(
            url,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                // Add authentication headers if needed
              }
            }
          );

        if (response.ok) {
          const data = await response.json();
          // setUserData(data.data);
        } else {
          console.error('Error fetching user data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    // Display a loading message while fetching data
    return <div>Loading...</div>;
  }

  if (!userData) {
    // Display an error message if the data couldn't be fetched
    return <div>Error fetching user data.</div>;
  }

  return (
    <CenteredLayout>
      {userData && (
        <WrapperDiv>
          <UserProfileHero userData={userData} />
          <UserProfileSettings userData={userData} />
        </WrapperDiv>
      )}
    </CenteredLayout>
  );
};

export default UserProfile;
