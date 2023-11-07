import React, { useEffect, useState } from 'react';
import CenteredLayout from '../components/UI/CenteredLayout';
import { formatMsToFullTime, getBaseUrl } from '../utils/utils';
import LoadingFullscreen from '../components/UI/LoadingFullscreen';
import RoundImg from '../components/UI/RoundImage';
import styled from 'styled-components';
import { primaryLightColor } from '../constants/color-tokens';
import { sm } from '../constants/styles';

const MainContent = styled.main`
  .avatar {
    width: 75px;
  }

  .table-container {
    width: 100%;
    overflow-x: auto;
  }

  table {
    th {
      font-size: 0.6rem;
      font-weight: bold;

      @media (width > ${sm}) {
        font-size: unset;
      }
    }

    tr {
      display: grid;
      grid-template-columns: 40px 2fr 1fr 1fr 1fr 1fr;
      @media (width > ${sm}) {
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
      }

      &:not(:last-of-type) {
        border-bottom: 1px ${primaryLightColor} solid;
      }
    }

    td {
      padding: 5px;
      font-size: 0.6rem;
      @media (width > ${sm}) {
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

    @media (width > ${sm}) {
      font-size: 1.3rem;
    }
  }

  .username {
    font-family: 'Dogica';
    font-weight: bold;

    justify-content: flex-start;
    font-size: 0.5rem;
    @media (width > ${sm}) {
      justify-content: inherit;
      font-size: 0.9rem;
    }
  }
`;

const Leaderboard: React.FC = (): JSX.Element => {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {isLoading && <LoadingFullscreen />}
      <CenteredLayout>
        <MainContent>
          <h1 className="title-1 mb-24">Leaderboard</h1>
          <div className="table-container">
            <table className="animate__animated animate__slideInDown">
              <thead>
                <tr>
                  <th>
                    <span className="sr-only">Rank</span>
                  </th>
                  {window.innerWidth > parseInt(sm) && (
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
                  {window.innerWidth > parseInt(sm) && <th>Win ratio</th>}
                  <th>Game time</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  if (leaderboardData.length > 0) {
                    return leaderboardData.map(
                      (leaderboardData: any, index) => {
                        return (
                          <tr key={`${leaderboardData.user.intraId}`}>
                            <td className="rank">#{index + 1}</td>
                            {window.innerWidth > parseInt(sm) && (
                              <td>
                                <RoundImg
                                  src={leaderboardData.user.avatar}
                                  alt=""
                                  className="avatar"
                                />
                              </td>
                            )}
                            <td className="title-3 username">
                              {leaderboardData.user.username}
                            </td>
                            <td className="title-3">
                              {leaderboardData.stats.rank}
                            </td>
                            <td>{leaderboardData.stats.wins}</td>
                            <td>{leaderboardData.stats.losses}</td>
                            {window.innerWidth > parseInt(sm) && (
                              <td>
                                {leaderboardData.stats.totalGames
                                  ? `${(
                                      (leaderboardData.stats.wins * 100) /
                                      leaderboardData.stats.totalGames
                                    ).toFixed()}%`
                                  : '-'}
                              </td>
                            )}
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
                  }
                })()}
              </tbody>
            </table>
          </div>
        </MainContent>
      </CenteredLayout>
    </>
  );
};

export default Leaderboard;
