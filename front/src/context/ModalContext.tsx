import React, { ReactNode, useContext, useState } from 'react';
import ModalContextData from '../interfaces/modal-context-data';

/**
 * The modal context object.
 */
const ModalContext = React.createContext<ModalContextData>({
  showModal: false,
  setShowModal: () => {},
});

/**
 * A custom hook to access the modal context.
 * @returns An object with the modal state and the function to update it.
 */
export function useModalContext(): ModalContextData {
  return useContext(ModalContext);
}

/**
 * The modal provider component.
 * @param children The child elements to render.
 * @returns The modal provider component.
 */
export function ModalProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const [showModal, setShowModal] = useState<boolean>(false);

  // Render the children with the modal context provider
  return (
    <ModalContext.Provider
      value={{
        showModal,
        setShowModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}
