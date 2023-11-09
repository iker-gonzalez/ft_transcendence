import React, { useState, useEffect } from 'react';
import User from '../../interfaces/chat-user.interface';
import { useUserData } from '../../context/UserDataContext';
import { fetchAuthorized, getBaseUrl } from '../../utils/utils';
import Cookies from 'js-cookie';

const StartChatPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    
    const [friends, setFriends] = useState<User[]>([]);

    const { userData } = useUserData();

    useEffect(() => {
      // Fetch all users that the signed in user has chatted with privately
      if (userData) {
        fetchAuthorized(`${getBaseUrl()}/friends/${userData?.intraId}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      })
      .then(response => response.json())
      .then((data: User[]) => { //Could we return an armonized object of users?
      
      const users = data.map(item => {
        return {
          id: item.id,
          avatar: item.avatar,
          username: item.username
        }
      });
        setFriends(users);
      });
    }}, [userData]); // Added dependency array

    return (
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', zIndex: 100 }}>
        {/* Your popup content goes here */}
        <button onClick={onClose}>Close</button>
      </div>
    );
};

export default StartChatPopup;