interface ICommonData {
  x: number;
  y: number;
  color: RenderColor;
}

interface IPositionData {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface ISounds {
  hit: HTMLAudioElement;
  wall: HTMLAudioElement;
  userScore: HTMLAudioElement;
  botScore: HTMLAudioElement;
  music: any;
}

export enum RenderColor {
  White = 'white',
  Black = 'black',
  Red = 'red',
  Green = 'green',
  Yellow = 'yellow',
  Grey = 'grey',
}

export interface IBallData extends ICommonData, IPositionData {
  radius: number;
  moveX: number;
  moveY: number;
  speed: number;
  reset: boolean;
}

export interface IUserData extends ICommonData, IPositionData {
  width: number;
  height: number;
  score: number;
}

export interface INetData extends ICommonData {
  width: number;
  height: number;
}

export interface IEndGamePayload {
  elapsedTime: number;
  gameDataId: string;
  player: {
    avatar: string;
    intraId: number;
    isWinner: boolean;
    score: number;
    username: string;
  };
  startedAt: Date;
}
