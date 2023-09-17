import React, { useEffect, useRef, useState } from 'react';
import { useGameRouteContext } from '../pages/Game';
import { createSearchParams, useNavigate } from 'react-router-dom';
import User from '../models/user.interface';
import SessionData from '../models/session-data.interface';
import MainButton from './UI/MainButton';
import { styled } from 'styled-components';
import CenteredLayout from './UI/CenteredLayout';
import RoundImg from './UI/RoundImage';
import { Socket, io } from 'socket.io-client';
import { getUrlWithRelativePath } from '../utils/utils';

type GameQueueRes = {
  queued: boolean;
};

type GameSessionRes = {
  success: boolean;
  data: SessionData;
};

const WrapperDiv = styled.div`
  .highlighted {
    color: yellow;
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
    background-color: white;
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

// TODO Replace with real userId from login
const userId: string | null = sessionStorage.getItem('intraId');

export default function GameQueue() {
  const navigate = useNavigate();

  const [isConnectionError, setIsConnectionError] = useState<boolean>(false);
  const [isQueued, setIsQueued] = useState<boolean>(false);
  const [isSessionCreated, setIsSessionCreated] = useState<boolean>(false);
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);

  const { sessionDataState } = useGameRouteContext();
  const matchmakingSocketRef = useRef<Socket>(
    io(`${getUrlWithRelativePath('matchmaking')}`, {
      transports: ['websocket'],
    }),
  );

  useEffect(() => {
    // TODO remove this when we have a better way to store userId
    if (!userId) {
      navigate('/');
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

    matchmakingSocketRef.current.on(
      `userJoined/${userId}`,
      (userJoinedRes: GameQueueRes) => {
        if (userJoinedRes.queued) {
          setIsQueued(true);
        }
      },
    );

    matchmakingSocketRef.current.on(
      `newSession/${userId}`,
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
      `unqueuedUser/${userId}`,
      (unqueuedUserRes: GameQueueRes) => {
        if (!unqueuedUserRes.queued) {
          setIsQueued(false);
        }
      },
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onJoinQueue = () => {
    matchmakingSocketRef.current.emit(
      'newUser',
      JSON.stringify({
        intraId: userId,
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
        intraId: userId,
      }),
    );
  };

  return (
    <WrapperDiv>
      <CenteredLayout>
        <h1>
          Game queue for user with intradId{' '}
          <span className="highlighted">{userId}</span>
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
                  {sessionDataState[0].players.map((player: User) => {
                    return (
                      <div className="user-box" key={player.id}>
                        <p>{player.username}</p>
                        <RoundImg alt="" src={player.avatar} />
                      </div>
                    );
                  })}
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
