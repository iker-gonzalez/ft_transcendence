interface ICommonData {
  x: number;
  y: number;
  color: Color;
}

export enum Color {
  White = 'WHITE',
}

export enum RenderColor {
  White = 'white',
  Black = 'black',
  Red = 'red',
  Green = 'green',
  Yellow = 'yellow',
  Grey = 'grey',
}

export interface IBallData extends ICommonData {
  radius: number;
  velocityX: number;
  velocityY: number;
  speed: number;
  reset: boolean;
}

export interface IUserData extends ICommonData {
  width: number;
  height: number;
  score: number;
}

export interface INetData extends ICommonData {
  width: number;
  height: number;
}

export interface INewSessionPayload {
  created: number;
  data: {
    id: string;
    ball: IBallData;
    players: IUserData[];
  };
}
