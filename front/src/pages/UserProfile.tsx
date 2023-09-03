import React, { useEffect, useState } from 'react';
import {getBaseUrl} from '../utils/utils';

// Define a TypeScript interface for the user data
interface UserData {
  id: string;
  createdAt: string;
  updatedAt: string;
  isTwoFactorAuthEnabled: boolean;
  intraId: number;
  username: string;
  avatar: string;
  email: string;
}

function UserProfile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const url = `${getBaseUrl()}/users/me`;
  console.log(url);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
          setUserData(data.data);
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
  }, []);

  if (loading) {
    // Display a loading message while fetching data
    return <div>Loading...</div>;
  }

  if (!userData) {
    // Display an error message if the data couldn't be fetched
    return <div>Error fetching user data.</div>;
  }

  return (
    <div>
      <h2>User Profile</h2>
      <div>
        <p>ID: {userData.id}</p>
        <p>Created At: {userData.createdAt}</p>
        <p>Updated At: {userData.updatedAt}</p>
        <p>Two-Factor Auth Enabled: {userData.isTwoFactorAuthEnabled ? 'Yes' : 'No'}</p>
        <p>Intra ID: {userData.intraId}</p>
        <p>Username: {userData.username}</p>
        <p>Email: {userData.email}</p>
        <p>Avatar: <img src={userData.avatar} alt="Avatar" /></p>
      </div>
    </div>
  );
}

export default UserProfile;
