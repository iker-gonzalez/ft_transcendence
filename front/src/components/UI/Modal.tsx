import React, { PropsWithChildren } from 'react';
import ReactDom from 'react-dom';
import styled from 'styled-components';
import { darkerBgColor, primaryLightColor } from '../../constants/color-tokens';

type ModalProps = PropsWithChildren<{
  dismissModalAction: () => void;
}>;

const WrapperDiv = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 99;

  width: 100vw;
  height: 100vh;

  overflow: hidden;

  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);

  display: flex;
  justify-content: center;
  align-items: center;

  .modal {
    position: relative;

    width: fit-content;
    min-width: 450px;
    max-width: 500px;
    min-height: 250px;

    background-color: ${darkerBgColor};

    padding: 35px;
    border-radius: 20px;

    text-align: center;

    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .close-btn {
    position: absolute;
    top: 10px;
    right: 10px;

    color: ${primaryLightColor};
    font-size: 1rem;
    font-weight: bold;

    background-color: unset;
    border: none;
    cursor: pointer;

    &:hover {
      transform: scale(1.2);
    }
  }
`;

const Modal: React.FC<ModalProps> = ({
  dismissModalAction,
  children,
}): JSX.Element => {
  const onModalDismissal = (e: React.MouseEvent<HTMLElement>) => {
    // Prevents the modal from closing when clicking on the modal itself
    if (e.target !== e.currentTarget) return;

    dismissModalAction();
  };

  return ReactDom.createPortal(
    <WrapperDiv onClick={onModalDismissal}>
      <div className="modal">
        <button type="button" className="close-btn" onClick={onModalDismissal}>
          ✗
        </button>
        {children}
      </div>
    </WrapperDiv>,
    document.getElementById('modal') as HTMLElement,
  );
};

export default Modal;
