import GameSessionUser from './game-session-user.interface';

export default interface SessionData {
  id: string;
  createdAt: string;
  players: GameSessionUser[];
}
