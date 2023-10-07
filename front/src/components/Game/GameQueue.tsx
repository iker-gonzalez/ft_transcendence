import React, { useEffect, useState } from 'react';
import { useGameRouteContext } from '../../pages/Game';
import { createSearchParams, useNavigate } from 'react-router-dom';
import MainButton from '../UI/MainButton';
import { styled } from 'styled-components';
import CenteredLayout from '../UI/CenteredLayout';
import RoundImg from '../UI/RoundImage';
import { primaryAccentColor } from '../../constants/color-tokens';
import SessionData from '../../interfaces/game-session-data.interface';
import GameSessionUser from '../../interfaces/game-session-user.interface';
import useMatchmakingSocket, {
  UseMatchmakingSocket,
} from './useMatchmakingSocket';
import ContrastPanel from '../UI/ContrastPanel';
import versusSvg from '../../assets/svg/battle.svg';

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

    .users-box {
      display: flex;
      gap: 20px;

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

    .versus-icon {
      width: 60px;
      height: auto;
      transform: translateY(20px);
    }

    .game-cta {
      margin-top: 30px;
    }
  }
`;

export default function GameQueue(): JSX.Element {
  const navigate = useNavigate();
  const { sessionDataState, userData } = useGameRouteContext();

  const [isQueued, setIsQueued] = useState<boolean>(false);
  const [isSessionCreated, setIsSessionCreated] = useState<boolean>(false);

  const {
    matchmakingSocketRef,
    isConnectionError,
    isSocketConnected,
  }: UseMatchmakingSocket = useMatchmakingSocket();

  useEffect(() => {
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

  const showMeFirst = (user: GameSessionUser) => {
    if (user.intraId === userData.intraId) return -1;
    return 1;
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

          if (isSessionCreated) {
            return (
              <>
                <h2 className="title-2 mb-16">This is your new session</h2>
                <ContrastPanel className="session-box">
                  <div className="users-box">
                    {sessionDataState[0].players
                      .sort(showMeFirst)
                      .map((player: GameSessionUser, index: number) => {
                        return (
                          <>
                            <div className="user-box" key={player.id}>
                              <p className="title-3 mb-8">{player.username}</p>
                              <RoundImg alt="" src={player.avatar} />
                            </div>
                            {(() => {
                              if (index === 0) {
                                return (
                                  <img
                                    src={versusSvg}
                                    alt=""
                                    className="versus-icon"
                                  />
                                );
                              }
                            })()}
                          </>
                        );
                      })}
                  </div>
                  <MainButton className="game-cta" onClick={onGoToMatch}>
                    Go to match
                  </MainButton>
                </ContrastPanel>
              </>
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
        <p className="mb-16">
          Game queue for user with intradId{' '}
          <span className="highlighted">{userData?.intraId}</span>
        </p>
      </CenteredLayout>
    </WrapperDiv>
  );
}
