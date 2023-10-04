import { IBallData, IUserData, INetData, RenderColor } from './game_pong.interfaces';

export const thickness: number = 10;
export const slit: number = 3;
export const userSpeedInput: number = 10;
export const ballDataInit: IBallData = {
  x: 0,
  y: 0,
  radius: 15,
  velocityX: 5,
  velocityY: 5,
  speed: userSpeedInput,
  color: RenderColor.White,
  reset: false,
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

export const user1Init: IUserData = {
  x: 30,
  y: 0,
  width: 10,
  height: 100,
  score: 0,
  color: RenderColor.White,
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

export const user2Init: IUserData = {
  x: 0,
  y: 0,
  width: 10,
  height: 100,
  score: 0,
  color: RenderColor.White,
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

export const netInit: INetData = {
  x: 0,
  y: 0,
  height: 10,
  width: 10,
  color: RenderColor.White,
};
