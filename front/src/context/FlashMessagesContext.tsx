import React, {
  PropsWithChildren,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import FlashMessageLevel from '../interfaces/flash-message-color.interface';
import FlashMessagesContextData from '../interfaces/flash-messages-context-data.interface';

const FlashMessagesContext = React.createContext<FlashMessagesContextData>({
  launchFlashMessage: () => {},
  level: FlashMessageLevel.SUCCESS,
  setShowFlashMessage: () => {},
  showFlashMessage: false,
  text: '',
});

/**
 * Hook to access the flash messages data from the context.
 * @returns An object containing the flash messages data and functions to update it.
 */
export function useFlashMessages(): FlashMessagesContextData {
  return useContext(FlashMessagesContext);
}

/**
 * The provider component for the FlashMessagesContext.
 * @param props The component props.
 * @returns The FlashMessagesContext provider component.
 */
export function FlashMessagesProvider({
  children,
}: PropsWithChildren): ReactNode {
  const [text, setText] = useState<string>('');
  const [level, setLevel] = useState<FlashMessageLevel>(
    FlashMessageLevel.SUCCESS,
  );
  const [showFlashMessage, setShowFlashMessage] = useState<boolean>(false);

  useEffect(() => {
    if (!showFlashMessage) {
      setText('');
      setLevel(FlashMessageLevel.SUCCESS);
    }
  }, [showFlashMessage]);

  /**
   * Launches a flash message with the specified text and level.
   * @param text The text of the flash message.
   * @param level The level of the flash message (e.g. 'success', 'error', 'warning', etc.).
   */
  const launchFlashMessage = (text: string, level: FlashMessageLevel) => {
    setLevel(level);
    setShowFlashMessage(true);
    setText(text);
  };

  return (
    <FlashMessagesContext.Provider
      value={{
        launchFlashMessage,
        level,
        setShowFlashMessage,
        showFlashMessage,
        text,
      }}
    >
      {children}
    </FlashMessagesContext.Provider>
  );
}
