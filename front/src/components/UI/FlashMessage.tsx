import React, { useEffect, useState } from 'react';
import ReactDom from 'react-dom';
import styled from 'styled-components';
import {
  blackColor,
  errorColor,
  primaryColor,
  successColor,
} from '../../constants/color-tokens';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';

const WrapperDiv = styled.div`
  position: absolute;
  bottom: 80px;
  left: 60px;
  z-index: 100;

  width: fit-content;
  min-width: 300px;
  min-height: 100px;

  background-color: ${primaryColor};
  &.error {
    background-color: ${errorColor};
  }
  &.success {
    background-color: ${successColor};
  }

  display: flex;
  justify-content: flex-start;
  align-items: center;

  padding: 20px;
  border-radius: 5px;

  .close-btn {
    position: absolute;
    top: 10px;
    right: 10px;

    font-size: 1rem;
    font-weight: bold;

    background-color: unset;
    border: none;
    cursor: pointer;

    &:hover {
      transform: scale(1.2);
    }
  }

  .text {
    color: ${blackColor};
    font-weight: 500;
    font-size: 1.1rem;
  }
`;

const FlashMessage: React.FC<{ text: string; level?: FlashMessageLevel }> = ({
  text,
  level = FlashMessageLevel.INFO,
}) => {
  const [isSlideOutClass, setIsSlideOutClass] = useState<boolean>(false);

  const destroyFlashMessage = (): void => {
    const flashMessagesContainer = document.getElementById(
      'flash-messages-container',
    ) as HTMLElement;
    const flashMessage = document.getElementById(
      'flash-message',
    ) as HTMLElement;

    if (flashMessage) {
      setIsSlideOutClass(true);
      flashMessage.remove();

      const newFlashMessage: HTMLElement = document.createElement(
        'div',
      ) as HTMLElement;
      newFlashMessage.id = 'flash-message';

      flashMessagesContainer.appendChild(newFlashMessage);
    }
  };

  useEffect(() => {
    setIsSlideOutClass(false);

    const timer = setTimeout(() => {
      destroyFlashMessage();
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return ReactDom.createPortal(
    <WrapperDiv
      className={`${level} animate__animated ${
        isSlideOutClass ? 'animate__fadeOutLeft' : 'animate__fadeInLeftBig'
      }`}
    >
      <button
        type="button"
        aria-label="Dismiss"
        className="close-btn"
        onClick={() => {
          destroyFlashMessage();
        }}
      >
        ✗
      </button>
      <p className="text">{text}</p>
    </WrapperDiv>,
    document.getElementById('flash-message') as HTMLElement,
  );
};

export default FlashMessage;