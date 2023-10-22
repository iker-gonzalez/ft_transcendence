import { CANVAS_WIDTH } from '../constants/canvas';
import UserData from '../interfaces/user-data.interface';
import {
  IBallData,
  IUserData,
  INetData,
  RenderColor,
} from './game_pong.interfaces';
import BotAvatar from './images/c3po_avatar.webp';

export const thickness: number = 10;
export const slit: number = 3;
export const userSpeedInput: number = 5;
const BALL_SIZE_RATIO: number = 60;
const USER_SIZE_RATIO: number = 90;
export const NET_SIZE_RATIO: number = 90;
export const BALL_VELOCITY: number = 5;

export const ballDataInit: IBallData = {
  x: 0,
  y: 0,
  radius: +CANVAS_WIDTH / BALL_SIZE_RATIO,
  moveX: BALL_VELOCITY,
  moveY: BALL_VELOCITY,
  speed: userSpeedInput,
  color: RenderColor.White,
  reset: false,
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  
};

export const user1Init: IUserData = {
  x: 0,
  y: 0,
  width: +CANVAS_WIDTH / USER_SIZE_RATIO,
  height: (+CANVAS_WIDTH / USER_SIZE_RATIO) * 10,
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
  width: +CANVAS_WIDTH / USER_SIZE_RATIO,
  height: (+CANVAS_WIDTH / USER_SIZE_RATIO) * 10,
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
  height: +CANVAS_WIDTH / NET_SIZE_RATIO,
  width: +CANVAS_WIDTH / NET_SIZE_RATIO,
  color: RenderColor.White,
};

export const botUserData: UserData = {
  avatar: BotAvatar,
  email: 'bot@42urduliz.com',
  intraId: 42,
  isTwoFactorAuthEnabled: false,
  username: 'bot',
};
