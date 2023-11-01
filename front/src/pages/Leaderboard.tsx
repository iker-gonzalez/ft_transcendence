import React, { useEffect, useState } from 'react';
import CenteredLayout from '../components/UI/CenteredLayout';
import { formatMsToFullTime, getBaseUrl } from '../utils/utils';
import LoadingFullscreen from '../components/UI/LoadingFullscreen';
import RoundImg from '../components/UI/RoundImage';
import styled from 'styled-components';
import { darkerBgColor, primaryLightColor } from '../constants/color-tokens';

const MainContent = styled.main`
  .avatar {
    width: 75px;
  }

  .table-container {
    overflow: hidden;
  }

  table {
    th {
      font-weight: bold;
    }

    tr {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;

      &:not(:last-of-type) {
        border-bottom: 1px ${primaryLightColor} solid;
      }
    }

    td {
      padding: 15px;

      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .username {
    font-family: 'Dogica';
    font-weight: bold;
    font-size: 1rem;
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
                  <th>
                    <span className="sr-only">Avatar</span>
                  </th>
                  <th>
                    <span className="sr-only">Username</span>
                  </th>
                  <th>Level</th>
                  <th>Wins</th>
                  <th>Losses</th>
                  <th>Win ratio</th>
                  <th>Total game time</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  if (leaderboardData.length > 0) {
                    return leaderboardData.map(
                      (leaderboardData: any, index) => {
                        return (
                          <tr key={`${leaderboardData.user.intraId}`}>
                            <td className="title-1">
                              #{index + 1}{' '}
                              <span
                                className={`${
                                  index === 0 &&
                                  'animate__animated animate__tada animate__delay-2s'
                                }`}
                              >
                                {(() => {
                                  switch (index) {
                                    case 0:
                                      return '🥇';
                                    case 1:
                                      return '🥈';
                                    case 2:
                                      return '🥉';
                                    default:
                                      return '';
                                  }
                                })()}
                              </span>
                            </td>
                            <td>
                              <RoundImg
                                src={leaderboardData.user.avatar}
                                alt=""
                                className="avatar"
                              />
                            </td>
                            <td className="title-3 username">
                              {leaderboardData.user.username}
                            </td>
                            <td className="title-3">
                              {leaderboardData.stats.rank}
                            </td>
                            <td>{leaderboardData.stats.wins} wins</td>
                            <td>{leaderboardData.stats.losses} losses</td>
                            <td>
                              {leaderboardData.stats.totalGames
                                ? `${(
                                    (leaderboardData.stats.wins * 100) /
                                    leaderboardData.stats.totalGames
                                  ).toFixed()}%`
                                : '-'}
                            </td>
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
