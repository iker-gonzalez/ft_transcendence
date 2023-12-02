import { DefaultEventsMap } from '@socket.io/component-emitter';
import { Socket } from 'socket.io-client';
import {
  ballDataInit,
  user1Init,
  user2Init,
  netInit,
  botUserData,
  userSpeedInput,
  thickness,
  slit,
  stepPaddle,
} from './game_pong.constants';
import {
  InitializeCanvasImages,
  countDownToStart,
  drawRect,
  drawText,
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
  RenderColor,
} from './game_pong.interfaces';
import GameSessionUser from '../interfaces/game-session-user.interface';
import UserData from '../interfaces/user-data.interface';
import { matchUser1, matchUser2, onGameEnd, render } from './game_pong.render';
import GameTheme from '../interfaces/game-theme.interface';
import GamePowerUp from '../interfaces/game-power-up.interface';

const fps: number = 30;
let computedFps: number = (1000 / fps) * 2;
let computedFpsSoloMode: number = computedFps * 0.55;
let computedFpsMultiMode: number = computedFps * 1;
let matchFinish: boolean = false;
export const matchPoints: number = 5;
let countDown: number = 3;
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
  theme: GameTheme;
  powerUps: GamePowerUp[];
};

export async function gameLoop({
  canvas,
  socket,
  isPlayer1,
  sessionId,
  usersData,
  theme,
  powerUps,
}: GameLoopFunctionParams) {
  // Reset state when a new game starts
  matchFinish = false;
  const startedAt: Date = new Date();

  // TODO render theme assets in game
  console.log('theme is', theme);

  // TODO render powerUps in game
  console.log('powerUps are', powerUps[0], powerUps[1]);

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
    stepPaddle,
    sounds,
    theme,
  });

  eventList.forEach(
    ({ typeEvent, handler }: { typeEvent: string; handler: () => void }) => {
      window.addEventListener(typeEvent, handler);
    },
  );

  console.log('Is Ball Frozen? ', isBallFrozen);
  if (isFirstRun) {
    countDownToStart(countDown, canvas, sounds);
    isFirstRun = false;
  }
  
  // Abort game if the user closes the tab
  onAbortGame(socket, sessionId, isPlayer1);

  if (!isSoloMode(usersData)) {
    initializeSocketLogic({
      socket,
      isPlayer1,
      sessionId,
      startedAt,
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
      theme,
      isFirstRun,
      countDown,
      powerUps,
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
    startedAt,
    eventList,
    canvasImages,
    theme,
    powerUps,
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
  startedAt: Date;
  eventList: any[];
  canvasImages: InitializeCanvasImages;
  theme: GameTheme;
  powerUps: any;
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
  startedAt,
  eventList,
  canvasImages,
  theme,
  powerUps,
}: GameFunctionParams) {
  // Clean up if one of the players leaves the game
  const isAbortedMatch = true;
  socket.on(`gameAborted/user1/${sessionId}`, () => {
    matchFinish = true;
    onGameEnd({
      canvas,
      eventList,
      socket,
      sessionId,
      startedAt,
      player: user1,
      userData: usersData.user1,
      sounds,
      isAbortedMatch,
      isFirstRun,
      countDown,
      isBallFrozen,
    });
  });
  socket.on(`gameAborted/user2/${sessionId}`, () => {
    matchFinish = true;
    onGameEnd({
      canvas,
      eventList,
      socket,
      sessionId,
      startedAt,
      player: user2,
      userData: usersData.user2,
      sounds,
      isAbortedMatch,
      isFirstRun,
      countDown,
      isBallFrozen,
    });
  });

  if (matchFinish) {
    return;
  }

  setTimeout(
    () => {
      if (isSoloMode(usersData)) {
        matchUser1(canvas, ballData, user1, user2, sounds, theme, powerUps);
        matchUser2(canvas, ballData, user1, user2, sounds, theme, true);

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
          theme,
          isBallFrozen,
          countDown,
        );

        if (user1.score >= matchPoints || user2.score >= matchPoints) {
          // First save data of player 1
          onGameEnd({
            canvas,
            eventList,
            socket,
            sessionId,
            startedAt,
            player: user1,
            userData: usersData.user1,
            sounds,
            isFirstRun,
            countDown,
            isBallFrozen,
          });
          // Then of bot
          // Delay is required by the server to process the data
          setTimeout(() => {
            onGameEnd({
              canvas,
              eventList,
              socket,
              sessionId,
              startedAt,
              player: user2,
              userData: botUserData,
              sounds,
              isFirstRun,
              countDown,
              isBallFrozen,
            });
          }, 100);
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

      // console.log('Is Ball Frozen? ', isBallFrozen);
      // if (isFirstRun) {
      //   countDownToStart(countDown, canvas);
      //   isFirstRun = false;
      // }

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
          startedAt,
          eventList,
          canvasImages,
          theme,
          powerUps,
        });
      });
    },
    isSoloMode(usersData) ? computedFpsSoloMode : computedFpsMultiMode,
  );
}
