import { useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { getBaseUrl } from '../../utils/utils';

export type UseGameDataSocket = {
  socketRef: React.MutableRefObject<Socket>;
  isSocketConnected: boolean;
  isConnectionError: boolean;
};

export default function useGameDataSocket(
  sessionId: string | null,
): UseGameDataSocket {
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isConnectionError, setIsConnectionError] = useState(false);
  const [isSessionCreated, setIsSessionCreated] = useState(false);

  if (!sessionId) throw new Error('sessionId is null');

  const socketRef = useRef<Socket>(
    io(`${getBaseUrl()}/game-data`, {
      transports: ['websocket'],
    }),
  );

  socketRef.current.on('connect_error', (error) => {
    console.warn('GameData socket connection error: ', error);
    setIsSocketConnected(false);
    setIsConnectionError(true);
  });

  socketRef.current.on('disconnect', () => {
    console.warn('GameData socket disconnected');
    setIsSocketConnected(false);
  });

  socketRef.current.on('connect', async () => {
    console.info('Connected to GameData socket');
    if (!isSessionCreated) {
      setIsSessionCreated(true);
      socketRef.current.emit(
        'startGame',
        JSON.stringify({
          gameDataId: sessionId,
          ball: {},
          user1: {},
          user2: {},
        }),
      );
    }
  });

  return { isConnectionError, isSocketConnected, socketRef };
}
