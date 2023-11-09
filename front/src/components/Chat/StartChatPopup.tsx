import React from 'react';
import { useUserFriends } from '../../context/UserDataContext';

const StartChatPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    
    const { userFriends } = useUserFriends();
    console.log('friends:', userFriends);

    return (
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', zIndex: 100 }}>
        {/* Your popup content goes here */}
        {userFriends.map((friend, index) => (
          <p key={index}>{friend.username}</p>
        ))}
        <button onClick={onClose}>Close</button>
      </div>
    );
};

export default StartChatPopup;