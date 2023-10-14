import { Dispatch, SetStateAction } from 'react';
import UserGameData from './user-game-data.interface';

export default interface UserGamesContextData {
  userGames: UserGameData[];
  setUserGames: Dispatch<SetStateAction<UserGameData[]>>;
  isFetchingGames: boolean;
  fetchGamesList: (intraId: number) => void;
  isErrorFetchingGames: boolean;
}
