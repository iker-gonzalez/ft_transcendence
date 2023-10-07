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
import waitingAnimationData from '../../assets/lotties/playing.json';
import Lottie from 'lottie-react';

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
          width: 130px;
        }
      }
    }

    .versus-icon {
      width: 60px;
      height: auto;
      transform: translateY(-20px);
    }
  }

  .waiting-animation {
    width: 600px;
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
                <h2 className="title-2 mb-24">This is your new session</h2>
                <ContrastPanel className="session-box mb-16">
                  <div className="users-box mb-24">
                    {sessionDataState[0].players.map(
                      (player: GameSessionUser) => {
                        return (
                          <div key={player.id}>
                            <div className="user-box">
                              <RoundImg
                                alt=""
                                src={player.avatar}
                                className="mb-8"
                              />
                              <p className="title-3">{player.username}</p>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                  <MainButton onClick={onGoToMatch}>Go to match</MainButton>
                </ContrastPanel>
              </>
            );
          } else {
            if (isQueued) {
              return (
                <>
                  <h1 className="title-1 mb-16">Your opponent is on the way</h1>
                  <p className="mb-16">
                    Queue joined. Be patient, your moment will come...
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
            } else {
              return (
                <>
                  <h1 className="title-1 mb-16">Find a peer to challenge</h1>
                  <MainButton
                    onClick={onJoinQueue}
                    disabled={!isSocketConnected}
                  >
                    Join game
                  </MainButton>
                </>
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
