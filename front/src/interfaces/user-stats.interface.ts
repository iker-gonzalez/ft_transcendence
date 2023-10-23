import UserCoreData from './user-core-data.interface';

interface UserStats {
  rank: number;
  totalGames: number;
  wins: number;
  losses: number;
  longestWinStreak: number;
  currentWinStreak: number;
  longestMatch: number;
  quickestWin: number;
  totalGameTime: number;
  nemesis: UserCoreData & { count: number };
  victim: UserCoreData & { count: number };
  busiestDay: {
    date: string;
    count: number;
  };
}

export default UserStats;
