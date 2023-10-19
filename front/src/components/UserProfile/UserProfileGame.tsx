import React, { useEffect } from 'react';
import UserData from '../../interfaces/user-data.interface';
import styled from 'styled-components';
import ContrastPanel from '../UI/ContrastPanel';
import { useUserGames } from '../../context/UserDataContext';
import RoundImg from '../UI/RoundImage';
import { primaryLightColor } from '../../constants/color-tokens';
import UserGameData from '../../interfaces/user-game-data.interface';
import UserGameDataPlayer from '../../interfaces/user-game-data-player.interface';
import MainButton from '../UI/MainButton';
import { useNavigate } from 'react-router-dom';

const WrapperDiv = styled.div`
  width: 650px;

  .session-box {
    padding: 24px 0;

    &:not(:last-of-type) {
      border-bottom: 1px ${primaryLightColor} solid;
    }
  }

  .title-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;

    margin-bottom: 24px;
  }

  .players-box {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 25px;

    .battle-icon {
      font-size: 40px;
      position: relative;
      top: 25px;
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

  .empty-state {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }
`;

const UserProfileGame: React.FC<{ userData: UserData }> = ({
  userData,
}): JSX.Element => {
  const { userGames, isFetchingGames, fetchGamesList, isErrorFetchingGames } =
    useUserGames();
  const navigate = useNavigate();

  useEffect(() => {
    fetchGamesList(userData.intraId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ContrastPanel>
      <WrapperDiv>
        <h2 className="title-2 mb-16">Game history</h2>
        {(() => {
          if (isErrorFetchingGames) {
            return (
              <p>
                There was an error fetching your game history. Try reloading the
                page.
              </p>
            );
          }

          if (isFetchingGames) {
            return <p>Loading...</p>;
          }

          if (userGames.length === 0) {
            return (
              <div className="empty-state">
                <p>It looks like you haven't played any game yet. </p>
                <MainButton
                  onClick={() => {
                    navigate('/game');
                  }}
                >
                  Start playing now
                </MainButton>
              </div>
            );
          }

          return (
            <div>
              {userGames.map((game: UserGameData, index) => {
                const formattedDate = new Date(
                  game.startedAt,
                ).toLocaleDateString('en-us', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                });
                const formattedTime = new Date(
                  game.startedAt,
                ).toLocaleTimeString('en-us', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                });
                const gameDuration = new Date(game.elapsedTime).getSeconds();

                return (
                  <div key={game.sessionId} className="session-box">
                    <div className="title-box">
                      <h3 className="title-3">Match #{index + 1}</h3>
                      <p className="small">
                        Played on {formattedDate} at {formattedTime} for{' '}
                        {gameDuration} seconds.
                      </p>
                    </div>
                    <div className="players-box">
                      {game.players
                        .sort((a: UserGameDataPlayer) => {
                          return a.intraId === userData.intraId ? -1 : 1;
                        })
                        .map((player: UserGameDataPlayer, indexPlayer) => {
                          return (
                            <>
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
                              {indexPlayer === 0 && (
                                <span className="battle-icon" aria-label="vs">
                                  ⚔️
                                </span>
                              )}
                            </>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </WrapperDiv>
    </ContrastPanel>
  );
};

export default UserProfileGame;
