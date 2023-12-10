import React, { useEffect, useState } from 'react';
import CenteredLayout from '../components/UI/CenteredLayout';
import { formatMsToFullTime, getBaseUrl } from '../utils/utils';
import LoadingFullscreen from '../components/UI/LoadingFullscreen';
import RoundImg from '../components/UI/RoundImage';
import styled from 'styled-components';
import { primaryLightColor } from '../constants/color-tokens';
import { lg } from '../constants/styles';

const MainContent = styled.main`
  .avatar {
    width: 75px;
    height: 75px;
    object-fit: cover;
  }

  .table-container {
    width: 100%;
    overflow-x: auto;
  }

  table {
    th {
      font-size: 0.6rem;
      font-weight: bold;
      margin-bottom: 16px;

      @media (width > ${lg}) {
        font-size: unset;
      }
    }

    tr {
      display: grid;
      grid-template-columns: 40px 125px 1fr 1fr 1fr 1fr;
      @media (width > ${lg}) {
        grid-template-columns: 60px 1fr 200px 1fr 1fr 1fr 1fr;
      }

      &:not(:last-of-type) {
        border-bottom: 1px ${primaryLightColor} solid;
      }

      &:first-of-type {
        border-radius: 20px 20px 0 0;
      }

      &:last-of-type {
        border-radius: 0 0 20px 20px;
      }
    }

    td {
      padding: 5px;
      font-size: 0.6rem;
      @media (width > ${lg}) {
        padding: 15px;
        font-size: inherit;
      }

      text-align: center;

      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .rank {
    font-weight: bold;
    font-size: 0.8rem;

    @media (width > ${lg}) {
      font-size: 1.3rem;
    }
  }

  .username-cell {
    justify-content: flex-start;
    .username {
      font-family: 'Dogica';
      font-weight: bold;

      overflow: hidden;
      white-space: nowrap;
      display: block;
      text-overflow: ellipsis;

      font-size: 0.4rem;
      @media (width > ${lg}) {
        justify-content: inherit;
        font-size: 0.8rem;
      }
    }
  }
`;

const Leaderboard: React.FC = (): JSX.Element => {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [innerWidth, setInnerWidth] = useState<number>(window.innerWidth);

  const handleWindowSizeChange = () => {
    setInnerWidth(window.innerWidth);
  };

  useEffect(() => {
    setIsLoading(true);
    fetch(`${getBaseUrl()}/game/leaderboard`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (data.found > 0) {
          setLeaderboardData(data.data);
        } else {
          setLeaderboardData([]);
        }
        setIsLoading(false);
      });

    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {isLoading && <LoadingFullscreen />}
      <CenteredLayout>
        <MainContent>
          <h1 className="title-1 mb-24">Leaderboard</h1>
          {leaderboardData.length === 0 ? (
            <p>For now, there is nothing to show here 😢</p>
          ) : (
            <div className="table-container">
              <table className="animate__animated animate__slideInDown">
                <thead>
                  <tr>
                    <th>
                      <span className="sr-only">Rank</span>
                    </th>
                    {innerWidth > parseInt(lg) && (
                      <th>
                        <span className="sr-only">Avatar</span>
                      </th>
                    )}
                    <th>
                      <span className="sr-only">Username</span>
                    </th>
                    <th>Level</th>
                    <th>Wins</th>
                    <th>Losses</th>
                    <th>Game time</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    return leaderboardData.map(
                      (leaderboardData: any, index) => {
                        return (
                          <tr key={`${leaderboardData.user.intraId}`}>
                            <td className="rank">#{index + 1}</td>
                            {innerWidth > parseInt(lg) && (
                              <td>
                                <RoundImg
                                  src={leaderboardData.user.avatar}
                                  alt=""
                                  className="avatar"
                                />
                              </td>
                            )}
                            <td className="title-3 username-cell">
                              <span className="username">
                                {leaderboardData.user.username}
                              </span>
                            </td>
                            <td className="title-3">
                              {leaderboardData.stats.rank}
                            </td>
                            <td>{leaderboardData.stats.wins}</td>
                            <td>{leaderboardData.stats.losses}</td>
                            <td>
                              {leaderboardData.stats.totalGameTime
                                ? formatMsToFullTime(
                                    leaderboardData.stats.totalGameTime,
                                  )
                                : '-'}
                            </td>
                          </tr>
                        );
                      },
                    );
                  })()}
                </tbody>
              </table>
            </div>
          )}
        </MainContent>
      </CenteredLayout>
    </>
  );
};

export default Leaderboard;
