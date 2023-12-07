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
import GameTheme from '../interfaces/game-theme.interface';
import GamePowerUp from '../interfaces/game-power-up.interface';

const fps: number = 30;
let computedFps: number = (1000 / fps) * 2;
let computedFpsSoloMode: number = computedFps * 0.55;
let computedFpsMultiMode: number = computedFps * 1;
export const matchPoints: number = 5;

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
  let countDown: number = 3;
  let matchFinish = false;
  const startedAt: Date = new Date();

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

  countDownToStart(countDown, canvas, sounds);

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
    countDown,
    matchFinish,
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
  countDown: number;
  matchFinish: boolean;
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
  countDown,
  matchFinish,
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
      countDown,
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
      countDown,
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
            countDown,
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
              countDown,
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
          countDown,
          matchFinish,
        });
      });
    },
    isSoloMode(usersData) ? computedFpsSoloMode : computedFpsMultiMode,
  );
}
