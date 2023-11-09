import React from 'react';

const StartChatPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', zIndex: 100 }}>
      {/* Your popup content goes here */}
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default StartChatPopup;