import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onDismiss, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-content">
          {children}
        </div>
        <button onClick={onDismiss} className="modal-close-button">
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
