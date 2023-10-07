import React, { useEffect, useRef, useState } from 'react';
import { useGameRouteContext } from '../../pages/Game';
import { createSearchParams, useNavigate } from 'react-router-dom';
import MainButton from '../UI/MainButton';
import { styled } from 'styled-components';
import CenteredLayout from '../UI/CenteredLayout';
import RoundImg from '../UI/RoundImage';
import { Socket, io } from 'socket.io-client';
import { getBaseUrl } from '../../utils/utils';
import {
  primaryAccentColor,
  primaryLightColor,
} from '../../constants/color-tokens';
import SessionData from '../../interfaces/game-session-data.interface';
import GameSessionUser from '../../interfaces/game-session-user.interface';

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
    background-color: ${primaryLightColor};
    width: fit-content;
    color: black;
    border-radius: 25px;
    padding: 15px 30px;
    margin: 10px;

    .game-cta {
      margin-top: 20px;
    }
  }

  .users-box {
    display: flex;
    gap: 30px;

    .user-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      p {
        font-weight: bold;
      }

      img {
        width: 150px;
      }
    }
  }
`;

export default function GameQueue(): JSX.Element {
  const navigate = useNavigate();

  const { userData } = useGameRouteContext();
  const [isConnectionError, setIsConnectionError] = useState<boolean>(false);
  const [isQueued, setIsQueued] = useState<boolean>(false);
  const [isSessionCreated, setIsSessionCreated] = useState<boolean>(false);
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);

  const { sessionDataState } = useGameRouteContext();
  // TODO refactor matchmaking socket in a custom hook
  const matchmakingSocketRef = useRef<Socket>(
    io(`${getBaseUrl()}/matchmaking`, {
      transports: ['websocket'],
    }),
  );

  useEffect(() => {
    if (!userData) {
      matchmakingSocketRef.current.disconnect();
    }

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

            setIsSessionCreated(true);
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onJoinQueue = () => {
    matchmakingSocketRef.current.emit(
      'newUser',
      JSON.stringify({
        intraId: userData!.intraId,
      }),
    );
  };

  const onGoToMatch = () => {
    navigate(
      {
        pathname: '/game/match',
        search: createSearchParams({
          sessionId: sessionDataState[0].id,
        }).toString(),
      },
      {
        replace: true,
      },
    );
  };

  const onRemoveFromQueue = () => {
    matchmakingSocketRef.current.emit(
      'unqueueUser',
      JSON.stringify({
        intraId: userData!.intraId,
      }),
    );
  };

  return (
    <WrapperDiv>
      <CenteredLayout>
        <h1>
          Game queue for user with intradId{' '}
          <span className="highlighted">{userData?.intraId}</span>
        </h1>
        <p>
          This is the page that is shown when users decide to join the queue.
        </p>
        <p>
          The user joins the queue and stays there until they're joined by
          another user.
        </p>
        {(function () {
          if (isConnectionError) {
            return (
              <p className="error-message">
                Server error. Reconnecting to server...
              </p>
            );
          }

          if (isSessionCreated) {
            return (
              <div className="session-box">
                <h2>This is your new session</h2>
                <div className="users-box">
                  {sessionDataState[0].players.map(
                    (player: GameSessionUser) => {
                      return (
                        <div className="user-box" key={player.id}>
                          <p>{player.username}</p>
                          <RoundImg alt="" src={player.avatar} />
                        </div>
                      );
                    },
                  )}
                </div>
                <MainButton className="game-cta" onClick={onGoToMatch}>
                  Go to match
                </MainButton>
              </div>
            );
          } else {
            if (isQueued) {
              return (
                <>
                  <p className="highlighted">
                    Queue joined. Waiting for another player to join...
                  </p>
                  <MainButton onClick={onRemoveFromQueue}>
                    Remove from queue
                  </MainButton>
                </>
              );
            } else {
              return (
                <MainButton onClick={onJoinQueue} disabled={!isSocketConnected}>
                  Join game
                </MainButton>
              );
            }
          }
        })()}
      </CenteredLayout>
    </WrapperDiv>
  );
}
