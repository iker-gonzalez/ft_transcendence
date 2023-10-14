import UserGameDataPlayer from './user-game-data-player.interface';

type UserGameData = {
  sessionId: string;
  startedAt: string;
  elapsedTime: number;
  players: UserGameDataPlayer[];
};

export default UserGameData;
