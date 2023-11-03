import React, { useEffect, useRef } from 'react';
import MainButton from '../../UI/MainButton';
import GameSessionUser from '../../../interfaces/game-session-user.interface';
import RoundImg from '../../UI/RoundImage';
import { createSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import UserStatsInfo from '../../shared/UserStatsInfo';
import useGameDataSocket from '../useGameDataSocket';
import { useFlashMessages } from '../../../context/FlashMessagesContext';
import FlashMessageLevel from '../../../interfaces/flash-message-color.interface';
import { useGameRouteContext } from '../../../pages/Game';
import { getIsPlayer1 } from '../../../utils/utils';

interface GameMatchQueueSessionProps {
  players: GameSessionUser[];
  sessionId: string;
}

const WrapperDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .users-box {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 25px;
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
`;

const GameMatchQueueSession: React.FC<GameMatchQueueSessionProps> = ({
  players,
  sessionId,
}): JSX.Element => {
  const wasSessionAccepted = useRef<boolean>(false);
  const { socketRef } = useGameDataSocket(sessionId);
  const { launchFlashMessage } = useFlashMessages();
  const { userData } = useGameRouteContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) {
      navigate('/game', { replace: true });
    }

    const socketCopy = socketRef.current;

    socketRef.current.on(
      `gameAborted/${
        getIsPlayer1(players, userData.intraId) ? 'user2' : 'user1'
      }/${sessionId}`,
      () => {
        navigate('/game', { replace: true });
        launchFlashMessage(
          'Your opponent abonded matchmaking 💔',
          FlashMessageLevel.INFO,
        );
        socketRef.current.disconnect();
      },
    );
    socketRef.current.on(`gameAborted/user2/${sessionId}`, () => {});

    return () => {
      if (!wasSessionAccepted.current) {
        socketCopy.emit(
          'abort',
          JSON.stringify({
            gameDataId: sessionId,
            isUser1: getIsPlayer1(players, userData.intraId),
          }),
          () => {
            launchFlashMessage(
              'You abandoned matchmaking 👎',
              FlashMessageLevel.INFO,
            );
            socketCopy.disconnect();
          },
        );
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onGoToMatch = () => {
    wasSessionAccepted.current = true;
    navigate(
      {
        pathname: '/game/match',
        search: createSearchParams({
          sessionId,
        }).toString(),
      },
      {
        replace: true,
      },
    );
  };

  return (
    <WrapperDiv>
      <div className="users-box mb-24">
        {players.map((player: GameSessionUser) => {
          return (
            <div key={player.id}>
              <div className="user-box mb-24">
                <p className="title-1 mb-8">{player.username}</p>
                <RoundImg alt="" src={player.avatar} />
              </div>
              <UserStatsInfo
                showOnlyEssentialStats={true}
                userId={player.intraId}
              />
            </div>
          );
        })}
      </div>
      <MainButton onClick={onGoToMatch}>Go to match</MainButton>
    </WrapperDiv>
  );
};

export default GameMatchQueueSession;
