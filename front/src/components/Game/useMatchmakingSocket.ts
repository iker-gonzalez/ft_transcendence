import { useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { getBaseUrl } from '../../utils/utils';

export type UseMatchmakingSocket = {
  matchmakingSocketRef: React.MutableRefObject<Socket>;
  isSocketConnected: boolean;
  isConnectionError: boolean;
};

export default function useMatchmakingSocket(): UseMatchmakingSocket {
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isConnectionError, setIsConnectionError] = useState(false);

  const matchmakingSocketRef = useRef<Socket>(
    io(`${getBaseUrl()}/matchmaking`, {
      transports: ['websocket'],
    }),
  );

  matchmakingSocketRef.current.on('connect_error', (error) => {
    setIsSocketConnected(false);
    setIsConnectionError(true);
    console.warn('Matchmaking socket connection error: ', error);
  });

  matchmakingSocketRef.current.on('disconnect', () => {
    setIsSocketConnected(false);
    console.warn('matchmaking socket disconnected');
  });

  matchmakingSocketRef.current.on('connect', async () => {
    setIsSocketConnected(true);
    setIsConnectionError(false);
    console.info('Matchmaking socket connected');
  });

  return { isConnectionError, isSocketConnected, matchmakingSocketRef };
}
