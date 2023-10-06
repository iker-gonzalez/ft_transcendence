import React from 'react';
import FlashMessageLevel from './flash-message-color.interface';

export default interface FlashMessagesContextData {
  launchFlashMessage: (text: string, level: FlashMessageLevel) => void;
  level: FlashMessageLevel;
  setShowFlashMessage: React.Dispatch<React.SetStateAction<boolean>>;
  showFlashMessage: boolean;
  text: string;
}
