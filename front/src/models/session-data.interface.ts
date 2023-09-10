import User from "./user.interface";

export default interface SessionData {
  id: string;
  createdAt: string;
  players: User[];
}
