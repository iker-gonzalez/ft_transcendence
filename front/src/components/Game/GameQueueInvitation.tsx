import React, { useEffect, useState } from 'react';
import LoadingFullscreen from '../UI/LoadingFullscreen';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserData } from '../../context/UserDataContext';
import Cookies from 'js-cookie';
import useMatchmakingSocket, {
  UseMatchmakingSocket,
} from './useMatchmakingSocket';
import SessionData from '../../interfaces/game-session-data.interface';
import { useGameRouteContext } from '../../pages/Game';

type GameSessionRes = {
  success: boolean;
  data: SessionData;
};

const GameQueueInvitation: React.FC = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { userData, fetchUserData } = useUserData();
  const { matchmakingSocketRef }: UseMatchmakingSocket = useMatchmakingSocket();
  const { sessionDataState } = useGameRouteContext();

  const [wasEventEmitted, setWasEventEmitted] = useState<boolean>(false);

  useEffect(() => {
    const token = Cookies.get('token');

    if (!userData && token) {
      fetchUserData(token);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (userData && !wasEventEmitted) {
      console.log(
        'cacca',
        JSON.stringify({
          inviter: searchParams.get('inviter'),
          invited: searchParams.get('invited'),
          id: searchParams.get('id'),
        }),
      );
      matchmakingSocketRef.current.emit(
        'invite',
        JSON.stringify({
          inviter: searchParams.get('inviter'),
          invited: searchParams.get('invited'),
          id: searchParams.get('id'),
        }),
        (newSessionRes: GameSessionRes) => {
          console.log('newSessionRes', newSessionRes);
          const setSessionData = sessionDataState[1];
          setSessionData(newSessionRes.data);

          navigate('/game/session');
        },
      );
      setWasEventEmitted(true);
    }
  }, [userData]); // eslint-disable-line react-hooks/exhaustive-deps

  return <LoadingFullscreen />;
};

export default GameQueueInvitation;
