import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  fetchAuthorized,
  formatMsToFullTime,
  getBaseUrl,
} from '../../utils/utils';
import Cookies from 'js-cookie';
import RoundImg from '../UI/RoundImage';
import LoadingSpinner from '../UI/LoadingSpinner';
import { darkerBgColor } from '../../constants/color-tokens';
import GradientBorder from '../UI/GradientBorder';
import MainButton from '../UI/MainButton';
import { useNavigate } from 'react-router-dom';

const WrapperDiv = styled.div`
  .centered-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .stats-container {
    display: flex;
    flex-direction: column;
    gap: 26px;
  }

  .basic-info-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 32px;

    padding: 15px 20px;

    background: ${darkerBgColor};

    .level-text {
      font-size: 26px;

      .level-highlight {
        font-size: 52px;
        font-weight: bold;
      }
    }

    .win-losses-text {
      > p {
        font-size: 20px;
      }

      .win-losses-highlight {
        font-size: 28px;
        font-weight: bold;
      }
    }
  }

  .stat-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 32px;

    > p {
      display: flex;
      align-items: center;
      gap: 8px;

      text-align: center;
    }

    .stat-highlight {
      font-size: 30px;
      font-weight: bold;
    }
  }

  .social-container {
    display: flex;
    flex-direction: column;
    gap: 24px;

    .image-container {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 16px;

      &.right {
        flex-direction: row-reverse;
        text-align: right;
      }

      span {
        font-weight: bold;
        font-size: 1.2rem;
      }

      .image {
        width: 60px;
        object-fit: contain;
      }
    }
  }
`;

type UserProfileStatsProps = {
  userId?: number;
};

const UserProfileStats: React.FC<UserProfileStatsProps> = ({
  userId,
}): JSX.Element => {
  const [stats, setStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    fetchAuthorized(`${getBaseUrl()}/game/stats${userId ? `/${userId}` : ''}`, {
      headers: {
        Authorization: `Bearer ${Cookies.get('token')}`,
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log('data.data', data.data);
        if (data.found > 0) {
          setStats(data.data);
        } else {
          setStats(null);
        }
        setIsLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const otherUserEmptyState = (
    <div>
      <p>
        This user hasn't played enough games to have meaningful stats yet 👶
      </p>
    </div>
  );

  const currentUserEmptyState = (
    <div>
      <p className="mb-16">
        These are rookie numbers! Start playing now to make your stats grow 🕹️
      </p>
      <MainButton
        onClick={() => {
          navigate('/game');
        }}
      >
        Play now
      </MainButton>
    </div>
  );
  return (
    <WrapperDiv>
      <h2 className="title-2 mb-24">Stats</h2>
      {(() => {
        if (isLoading) {
          return (
            <div className="centered-container">
              <LoadingSpinner />
            </div>
          );
        }

        if (!stats) {
          return userId ? otherUserEmptyState : currentUserEmptyState;
        }

        return (
          <div className="stats-container">
            <GradientBorder className="basic-info-container">
              <div>
                <h3 className="title-3 sr-only">Rank</h3>
                <p className="level-text">
                  lv. <span className="level-highlight">{stats.rank}</span>
                </p>
              </div>
              <div className="win-losses-text">
                <h3 className="title-3 sr-only">Wins & losses</h3>
                <p>
                  <span className="win-losses-highlight">🔼 {stats.wins}</span>{' '}
                  wins
                </p>
                <p>
                  <span className="win-losses-highlight">
                    🔽 {stats.losses}
                  </span>{' '}
                  losses
                </p>
              </div>
            </GradientBorder>
            {(() => {
              if (stats.totalGames < 5) {
                return userId ? otherUserEmptyState : currentUserEmptyState;
              }

              return (
                <>
                  <div>
                    <h3 className="title-3 mb-16">Win streak</h3>
                    <div className="stat-container">
                      <p>
                        longest
                        <span className="stat-highlight">
                          {stats.longestWinStreak} ✨
                        </span>
                      </p>
                      <p>
                        current
                        <span className="stat-highlight">
                          {stats.currentWinStreak}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="title-3 mb-16">Records</h3>
                    <div className="stat-container">
                      <p>
                        quickest win{' '}
                        <span className="stat-highlight">
                          {(stats.quickestWin / 1000).toFixed(0)}s
                        </span>
                      </p>
                      <p>
                        longest match{' '}
                        <span className="stat-highlight">
                          {formatMsToFullTime(stats.longestMatch)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="title-3 mb-16">Social</h3>
                    <div className="social-container">
                      <div>
                        <h4 className="sr-only">Nemesis</h4>
                        <div className="image-container">
                          <RoundImg
                            src={stats.nemesis.avatar}
                            alt=""
                            className="image"
                          />
                          <p>
                            <span>{stats.nemesis.username}</span> is your
                            nemesis, having defeated you{' '}
                            <span>{stats.nemesis.count}</span> times
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="sr-only">Target</h4>
                        <div className="image-container right">
                          <RoundImg
                            src={stats.victim.avatar}
                            alt=""
                            className="image"
                          />
                          <p>
                            <span>{stats.victim.username}</span> is your target,
                            having defeated them{' '}
                            <span>{stats.victim.count}</span>{' '}
                            {stats.victim.count === 1 ? 'time' : 'times'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        );
      })()}
    </WrapperDiv>
  );
};

export default UserProfileStats;
