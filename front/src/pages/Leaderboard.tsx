import React, { useEffect, useState } from 'react';
import CenteredLayout from '../components/UI/CenteredLayout';
import { formatMsToFullTime, getBaseUrl } from '../utils/utils';
import LoadingFullscreen from '../components/UI/LoadingFullscreen';
import RoundImg from '../components/UI/RoundImage';
import styled from 'styled-components';
import { primaryLightColor } from '../constants/color-tokens';

const MainContent = styled.main`
  .avatar {
    width: 75px;
  }

  table {
    th {
      font-weight: bold;
    }

    tr {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;

      &:not(:first-of-type) {
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
        console.log('data.data', data.data);
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
        <h1 className="title-1 mb-24">Leaderboard</h1>
        <MainContent>
          <table>
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
            {(() => {
              if (leaderboardData.length > 0) {
                return leaderboardData.map((leaderboardData: any, index) => {
                  return (
                    <tr key={`${leaderboardData.user.intraId}`}>
                      <td className="title-1">#{index + 1}</td>
                      <td>
                        <RoundImg
                          src={leaderboardData.user.avatar}
                          alt=""
                          className="avatar"
                        />
                      </td>
                      <td className="title-3">
                        {leaderboardData.user.username}
                      </td>
                      <td className="title-3">{leaderboardData.stats.rank}</td>
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
                });
              }
            })()}
          </table>
        </MainContent>
      </CenteredLayout>
    </>
  );
};

export default Leaderboard;
