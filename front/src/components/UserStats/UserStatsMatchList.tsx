import React, { useEffect, useRef } from 'react';
import UserData from '../../interfaces/user-data.interface';
import styled from 'styled-components';
import { useUserData, useUserGames } from '../../context/UserDataContext';
import RoundImg from '../UI/RoundImage';
import { primaryLightColor } from '../../constants/color-tokens';
import UserGameData from '../../interfaces/user-game-data.interface';
import UserGameDataPlayer from '../../interfaces/user-game-data-player.interface';
import MainButton from '../UI/MainButton';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../UI/LoadingSpinner';
import PaginatedSection from '../UI/PaginatedSection';
import { formatMsToFullTime } from '../../utils/utils';
import UserCoreData from '../../interfaces/user-core-data.interface';

const WrapperDiv = styled.div`
  .session-box {
    padding: 24px 0;

    &:not(:last-of-type) {
      border-bottom: 1px ${primaryLightColor} solid;
    }
  }

  .title-box {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 30px;

    margin-bottom: 24px;

    .title {
      white-space: nowrap;
    }

    .timestamp {
      text-align: right;
    }
  }

  .players-box {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 70px;

    &::before {
      content: '⚔️';
      font-size: 2rem;
      position: absolute;
      top: 70%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .player-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;

      .score-box {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;

        &.right {
          flex-direction: row-reverse;
        }

        .avatar {
          width: 75px;
        }
      }
    }
  }

  .centered-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .empty-state {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }
`;

type UserStatsMatchListProps = {
  userData: UserData | UserCoreData;
  numberOfItemsPerPage: number;
};

const UserStatsMatchList: React.FC<UserStatsMatchListProps> = ({
  userData,
  numberOfItemsPerPage,
}): JSX.Element => {
  const { userGames, isFetchingGames, fetchGamesList, isErrorFetchingGames } =
    useUserGames();
  const { userData: loggedUserData } = useUserData();

  const isCurrentUser = useRef(loggedUserData?.intraId === userData.intraId);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGamesList(userData.intraId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <WrapperDiv>
      <h2 className="title-2 mb-16">Game history</h2>
      {(() => {
        if (isErrorFetchingGames) {
          return (
            <div className="centered-container">
              <p>
                There was an error fetching your game history. Try reloading the
                page.
              </p>
            </div>
          );
        }

        if (isFetchingGames) {
          return (
            <div className="centered-container">
              <LoadingSpinner />
            </div>
          );
        }

        if (userGames.length === 0) {
          return (
            <div className="empty-state">
              {isCurrentUser.current ? (
                <>
                  <p>It looks like you haven't played any game yet. </p>
                  <MainButton
                    onClick={() => {
                      navigate('/game');
                    }}
                  >
                    Play&nbsp;now
                  </MainButton>
                </>
              ) : (
                <p>
                  There is nothing to see here. This player hasn't played any
                  game yet.
                </p>
              )}
            </div>
          );
        }

        return (
          <PaginatedSection numberOfItems={numberOfItemsPerPage}>
            {userGames.map((game: UserGameData, index) => {
              const formattedDate = new Date(game.startedAt).toLocaleDateString(
                'en-us',
                {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                },
              );
              const formattedTime = new Date(game.startedAt).toLocaleTimeString(
                'en-us',
                {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                },
              );

              return (
                <div key={game.sessionId} className="session-box">
                  <div className="title-box">
                    <h3 className="title-3 title">Match #{index + 1}</h3>
                    <p className="small timestamp">
                      Played on {formattedDate} at {formattedTime} for{' '}
                      {formatMsToFullTime(game.elapsedTime)}
                    </p>
                  </div>
                  <div className="players-box">
                    {game.players
                      .sort((a: UserGameDataPlayer) => {
                        return a.intraId === userData.intraId ? -1 : 1;
                      })
                      .map((player: UserGameDataPlayer, indexPlayer) => {
                        return (
                          <div className="player-box" key={player.intraId}>
                            <p className="title-3">
                              {player.username} {player.isWinner && '🏆'}
                            </p>
                            <div
                              className={`score-box ${
                                indexPlayer % 2 !== 0 ? 'right' : 'left'
                              }`}
                            >
                              <p className="title-1">{player.score}</p>
                              <RoundImg
                                src={player.avatar}
                                alt=""
                                className="avatar"
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </PaginatedSection>
        );
      })()}
    </WrapperDiv>
  );
};

export default UserStatsMatchList;
