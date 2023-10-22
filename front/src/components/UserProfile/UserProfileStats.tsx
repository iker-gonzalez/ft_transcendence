import React, { useEffect, useState } from 'react';
import ContrastPanel from '../UI/ContrastPanel';
import styled from 'styled-components';
import { fetchAuthorized, getBaseUrl } from '../../utils/utils';
import Cookies from 'js-cookie';
import RoundImg from '../UI/RoundImage';
import LoadingSpinner from '../UI/LoadingSpinner';

const WrapperDiv = styled.div`
  .centered-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .stats-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
`;

const UserProfileStats: React.FC = (): JSX.Element => {
  const [stats, setStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    fetchAuthorized(`${getBaseUrl()}/game/stats`, {
      headers: {
        Authorization: `Bearer ${Cookies.get('token')}`,
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log('data.data', data.data);
        setStats(data.data);
        setIsLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ContrastPanel>
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
            return (
              <div className="centered-container">
                <p>Empty state</p>
              </div>
            );
          }

          return (
            <div className="stats-container">
              <div>
                <h3 className="title-3">Rank</h3>
                <p>{stats.rank}</p>
              </div>
              <div>
                <h3 className="title-3 mb-16">Wins & losses</h3>
                <p>Total games: {stats.totalGames}</p>
                <p>Wins: {stats.wins}</p>
                <p>Losses: {stats.losses}</p>
              </div>
              <div>
                <h3 className="title-3 mb-16">Win streak</h3>
                <p>Longest streak: {stats.longestWinStreak}</p>
                <p>Current streak: {stats.currentWinStreak}</p>
              </div>
              <div>
                <h3 className="title-3 mb-16">Records</h3>
                <p>
                  Longest match: {new Date(stats.longestMatch).getSeconds()} sec
                </p>
                <p>
                  Quickest win: {new Date(stats.quickestWin).getSeconds()} sec
                </p>
              </div>
              <div>
                <h3 className="title-3 mb-16">Social</h3>
                <div>
                  <h4>Nemesis</h4>
                  <p>
                    {stats.nemesis.username} defeated you {stats.nemesis.count}{' '}
                    times
                  </p>
                  <RoundImg
                    src={stats.nemesis.avatar}
                    alt=""
                    style={{ width: '200px' }}
                  />
                </div>
                <div>
                  <h4>Target</h4>
                  <p>
                    You defeated {stats.victim.username} {stats.victim.count}{' '}
                    times
                  </p>
                  <RoundImg
                    src={stats.victim.avatar}
                    alt=""
                    style={{ width: '200px' }}
                  />
                </div>
              </div>
            </div>
          );
        })()}
      </WrapperDiv>
    </ContrastPanel>
  );
};

export default UserProfileStats;
