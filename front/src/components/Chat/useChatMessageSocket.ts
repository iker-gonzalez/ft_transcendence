import { useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { getBaseUrl } from '../../utils/utils';

export type UseChatMessageSocket = {
    chatMessageSocketRef: React.MutableRefObject<Socket>;
    isSocketConnected: boolean;
    isConnectionError: boolean;
  };

  export default function useChatMessageSocket(): UseChatMessageSocket {
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [isConnectionError, setIsConnectionError] = useState(false);
  
    const chatMessageSocketRef = useRef<Socket>(
      io(`${getBaseUrl()}/chat`, {
        transports: ['websocket'],
      }),
    );
  
    chatMessageSocketRef.current.on('connect_error', (error) => {
      setIsSocketConnected(false);
      setIsConnectionError(true);
      console.warn('Chat socket connection error: ', error);
    });
  
    chatMessageSocketRef.current.on('disconnect', () => {
      setIsSocketConnected(false);
      console.warn('Chat socket disconnected');
    });
  
    chatMessageSocketRef.current.on('connect', async () => {
      setIsSocketConnected(true);
      setIsConnectionError(false);
      console.info('Chat socket connected');
    });
  
    return { isConnectionError, isSocketConnected, chatMessageSocketRef };
  }