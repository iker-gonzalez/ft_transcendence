import { DefaultEventsMap } from '@socket.io/component-emitter';
import { Socket } from 'socket.io-client';
import {
  ballDataInit,
  user1Init,
  user2Init,
  netInit,
  botUserData,
} from './game_pong.constants';
import {
  InitializeCanvasImages,
  countDownToStart,
  initializeCanvasImages,
  initializeEventListeners,
  initializeSocketLogic,
  initializeSounds,
  isBallFrozen,
  isSoloMode,
  onAbortGame,
} from './game_pong.functions';
import {
  IBallData,
  INetData,
  ISounds,
  IUserData,
} from './game_pong.interfaces';
import GameSessionUser from '../interfaces/game-session-user.interface';
import UserData from '../interfaces/user-data.interface';
import { matchUser1, matchUser2, onGameEnd, render } from './game_pong.render';

const fps: number = 120;
const computedFps: number = (1000 / fps) * 2;
export const thickness: number = 10;
export const slit: number = 3;
const userSpeedInput: number = 10;
let matchFinish: boolean = false;
export const matchPoints: number = 50;
export const startedAt: Date = new Date();
let countDown: number = 5;
let isFirstRun: boolean = true;

type GameLoopFunctionParams = {
  canvas: HTMLCanvasElement;
  socket: Socket<DefaultEventsMap, DefaultEventsMap>;
  isPlayer1: boolean;
  sessionId: string;
  usersData: {
    user1: GameSessionUser | UserData;
    user2?: GameSessionUser | UserData;
  };
};

export async function gameLoop({
  canvas,
  socket,
  isPlayer1,
  sessionId,
  usersData,
}: GameLoopFunctionParams) {
  // Reset state when a new game starts
  matchFinish = false;

  // Update initial data
  let ballData = {
    ...ballDataInit,
    x: canvas.width / 2,
    y: canvas.height / 2,
  };
  let user1 = { ...user1Init, x: 45, y: canvas.height / 2 - 100 / 2 };
  let user2 = {
    ...user2Init,
    x: canvas.width - 55,
    y: canvas.height / 2 - 100 / 2,
  };
  let net = { ...netInit, x: canvas.width / 2 - 5 };

  const sounds = initializeSounds();

  sounds.music.play().catch(function (error: any) {});

  // Images need to be loaded once before rendering
  // Otherwise they create a flickering effect
  const canvasImages = initializeCanvasImages();

  const eventList = initializeEventListeners({
    canvas,
    isPlayer1,
    user1,
    userSpeedInput,
    usersData,
    user2,
    thickness,
    ballData,
    slit,
  });

  eventList.forEach(
    ({ typeEvent, handler }: { typeEvent: string; handler: () => void }) => {
      window.addEventListener(typeEvent, handler);
    },
  );

  // Abort game if the user closes the tab
  onAbortGame(socket, sessionId, isPlayer1);

  if (!isSoloMode(usersData)) {
    initializeSocketLogic({
      socket,
      isPlayer1,
      sessionId,
      ballData,
      user1,
      user2,
      matchPoints,
      matchFinish,
      usersData,
      canvas,
      eventList,
      sounds,
      net,
      canvasImages,
      thickness,
    });
  }

  game({
    canvas,
    ballData,
    sounds,
    user1,
    user2,
    usersData,
    net,
    socket,
    isPlayer1,
    matchPoints,
    sessionId,
    eventList,
    canvasImages,
  });
}

type GameFunctionParams = {
  canvas: HTMLCanvasElement;
  ballData: IBallData;
  sounds: ISounds;
  user1: IUserData;
  user2: IUserData;
  usersData: {
    user1: GameSessionUser | UserData;
    user2?: GameSessionUser | UserData;
  };
  net: INetData;
  socket: Socket;
  isPlayer1: boolean;
  matchPoints: number;
  sessionId: string;
  eventList: any[];
  canvasImages: InitializeCanvasImages;
};

function game({
  canvas,
  ballData,
  sounds,
  user1,
  user2,
  usersData,
  net,
  socket,
  isPlayer1,
  matchPoints,
  sessionId,
  eventList,
  canvasImages,
}: GameFunctionParams) {
  if (matchFinish) return;

  setTimeout(() => {
    if (isSoloMode(usersData)) {
      matchUser1(canvas, ballData, user1, user2, sounds);
      matchUser2(canvas, ballData, user1, user2, sounds, true);

      render(
        canvas,
        ballData,
        user1,
        user2,
        net,
        matchPoints,
        usersData,
        canvasImages,
        thickness,
        sounds,
      );

      if (user1.score >= matchPoints || user2.score >= matchPoints) {
        onGameEnd(canvas, eventList, socket, sessionId, user1, usersData.user1);
        // Delay is required by the server to process the data
        setTimeout(() => {
          onGameEnd(canvas, eventList, socket, sessionId, user2, botUserData);
        }, 500);
        matchFinish = true;
      }
    } else {
      socket.emit(
        'download',
        JSON.stringify({
          isUser1: isPlayer1,
          gameDataId: sessionId,
        }),
      );
    }

    console.log('Is Ball Frozen? ', isBallFrozen);
    if (isFirstRun) {
      countDownToStart(countDown);
      isFirstRun = false;
    }

    requestAnimationFrame(function () {
      game({
        canvas,
        ballData,
        sounds,
        user1,
        user2,
        usersData,
        net,
        socket,
        isPlayer1,
        matchPoints,
        sessionId,
        eventList,
        canvasImages,
      });
    });
  }, computedFps);
}
