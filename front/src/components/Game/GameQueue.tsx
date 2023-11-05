import React, { useEffect, useRef, useState } from 'react';
import { useGameRouteContext } from '../../pages/Game';
import MainButton from '../UI/MainButton';
import { styled } from 'styled-components';
import CenteredLayout from '../UI/CenteredLayout';
import { primaryAccentColor } from '../../constants/color-tokens';
import SessionData from '../../interfaces/game-session-data.interface';
import useMatchmakingSocket, {
  UseMatchmakingSocket,
} from './useMatchmakingSocket';
import waitingAnimationData from '../../assets/lotties/playing.json';
import Lottie from 'lottie-react';
import { useFlashMessages } from '../../context/FlashMessagesContext';
import FlashMessageLevel from '../../interfaces/flash-message-color.interface';
import QueueAnimationData from '../../assets/lotties/queue.json';
import { useNavigate } from 'react-router-dom';

const INACTIVITY_TIMEOUT = 20_000;

type GameQueueRes = {
  queued: boolean;
};

type GameSessionRes = {
  success: boolean;
  data: SessionData;
};

const WrapperDiv = styled.div`
  .highlighted {
    color: ${primaryAccentColor};
    font-weight: bold;
  }

  .error-message {
    color: red;
  }

  .session-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 450px;
  }

  .waiting-animation {
    width: 600px;
  }

  .queue-animation {
    width: 550px;
  }
`;

export default function GameQueue(): JSX.Element {
  const { sessionDataState, userData } = useGameRouteContext();

  const [isQueued, setIsQueued] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] =
    useState<number>(INACTIVITY_TIMEOUT);
  const inactivityTimeoutRef = useRef<number>(0);
  const navigate = useNavigate();

  const {
    matchmakingSocketRef,
    isConnectionError,
    isSocketConnected,
  }: UseMatchmakingSocket = useMatchmakingSocket();
  const { launchFlashMessage } = useFlashMessages();

  useEffect(() => {
    const matchmakingSocketRefCopy = matchmakingSocketRef.current;

    if (!userData) {
      matchmakingSocketRef.current.disconnect();
    }

    if (userData) {
      matchmakingSocketRef.current.on(
        `userJoined/${userData.intraId}`,
        (userJoinedRes: GameQueueRes) => {
          if (userJoinedRes.queued) {
            setIsQueued(true);
          }
        },
      );

      matchmakingSocketRef.current.on(
        `newSession/${userData.intraId}`,
        (newSessionRes: GameSessionRes) => {
          if (newSessionRes.success) {
            const setSessionData = sessionDataState[1];
            setSessionData(newSessionRes.data);

            window.clearInterval(inactivityTimeoutRef.current);
            navigate('/game/session');
          } else {
            console.warn('error creating session');
          }
        },
      );

      matchmakingSocketRef.current.on(
        `unqueuedUser/${userData.intraId}`,
        (unqueuedUserRes: GameQueueRes) => {
          if (!unqueuedUserRes.queued) {
            setIsQueued(false);
          }
        },
      );
    }

    return () => {
      window.clearTimeout(inactivityTimeoutRef.current);

      if (userData) {
        matchmakingSocketRefCopy.emit(
          'unqueueUser',
          JSON.stringify({
            intraId: userData.intraId,
          }),
        );
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onJoinQueue = () => {
    matchmakingSocketRef.current.emit(
      'newUser',
      JSON.stringify({
        intraId: userData!.intraId,
      }),
    );

    inactivityTimeoutRef.current = window.setTimeout(() => {
      launchFlashMessage(
        'Your queue session expired. Better luck next time.',
        FlashMessageLevel.INFO,
      );
      onRemoveFromQueue();
    }, INACTIVITY_TIMEOUT);

    for (let i = INACTIVITY_TIMEOUT / 1000; i > 0; i--) {
      setTimeout(() => {
        setCountdownValue(i);
      }, INACTIVITY_TIMEOUT - i * 1000);
    }
  };

  const onRemoveFromQueue = () => {
    matchmakingSocketRef.current.emit(
      'unqueueUser',
      JSON.stringify({
        intraId: userData!.intraId,
      }),
    );
    window.clearTimeout(inactivityTimeoutRef.current);
    setIsQueued(false);
  };

  return (
    <WrapperDiv>
      <CenteredLayout>
        {(function () {
          if (isConnectionError) {
            return (
              <p className="error-message">
                Server error. Reconnecting to server...
              </p>
            );
          }

          if (isQueued) {
            return (
              <>
                <h1 className="title-1 mb-16">Your opponent is on the way</h1>
                <p>
                  You will be thrown out of the current queue in{' '}
                  {countdownValue > 1
                    ? `${countdownValue} seconds`
                    : `${countdownValue} second`}
                  ...
                </p>
                <Lottie
                  animationData={waitingAnimationData}
                  className="waiting-animation mb-24"
                />
                <MainButton onClick={onRemoveFromQueue}>
                  Remove from queue
                </MainButton>
              </>
            );
          }

          return (
            <>
              <h1 className="title-1 mb-16">Find a peer to challenge</h1>
              <Lottie
                animationData={QueueAnimationData}
                loop={true}
                aria-hidden="true"
                className="mb-24 queue-animation"
              />
              <MainButton onClick={onJoinQueue} disabled={!isSocketConnected}>
                Join game queue
              </MainButton>
            </>
          );
        })()}
      </CenteredLayout>
    </WrapperDiv>
  );
}
