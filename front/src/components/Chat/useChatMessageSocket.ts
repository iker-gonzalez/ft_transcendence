import { useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { getBaseUrl } from '../../utils/utils';

export type UseChatMessageSocket = {
  chatMessageSocketRef: React.MutableRefObject<Socket | null>;
  isSocketConnected: boolean;
  isConnectionError: boolean;
};

export default function useChatMessageSocket(): UseChatMessageSocket {
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isConnectionError, setIsConnectionError] = useState(false);

  const chatMessageSocketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize the socket
    chatMessageSocketRef.current = io(`${getBaseUrl()}/chat`, {
      transports: ['websocket'],
    });

    const socket = chatMessageSocketRef.current;

    socket.on('connect_error', (error) => {
      setIsSocketConnected(false);
      setIsConnectionError(true);
      console.warn('Chat socket connection error: ', error);
    });

    socket.on('disconnect', () => {
      setIsSocketConnected(false);
      console.warn('Chat socket disconnected');
    });

    socket.on('connect', async () => {
      setIsSocketConnected(true);
      setIsConnectionError(false);
      console.info('Chat socket connected');
    });

    //Clean up the socket when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleanup on unmount

  return { isConnectionError, isSocketConnected, chatMessageSocketRef };
}