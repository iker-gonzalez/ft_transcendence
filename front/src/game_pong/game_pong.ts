import { DefaultEventsMap } from '@socket.io/component-emitter';
import { Socket } from 'socket.io-client';
import {
  ballDataInit,
  user1Init,
  user2Init,
  netInit,
} from './game_pong.constants';
import {
  checkCollision,
  drawArc,
  drawDashedLine,
  drawRect,
  drawText,
  initializeSounds,
} from './game_pong.functions';
import {
  IBallData,
  IEndGamePayload,
  INetData,
  ISounds,
  IUserData,
  RenderColor,
} from './game_pong.interfaces';
import GameSessionUser from '../interfaces/game-session-user.interface';

const fps: number = 60;
const computedFps: number = 1000 / fps;
const thickness: number = 10;
const slit: number = 3;
const userSpeedInput: number = 10;
let match_finish: boolean = false;
const match_points: number = 5;
const startedAt: Date = new Date();

function game(
  socket: Socket,
  isPlayer1: boolean,
  match_points: number,
  sessionId: string | null,
) {
  if (!match_finish) {
    setTimeout(() => {
      socket.emit(
        'download',
        JSON.stringify({
          isUser1: isPlayer1,
          gameDataId: sessionId,
        }),
      );

      requestAnimationFrame(function () {
        game(socket, isPlayer1, match_points, sessionId);
      });
    }, computedFps);
  }
}

function matchUser1(
  canvas: HTMLCanvasElement,
  ballData: IBallData,
  user1: IUserData,
  user2: IUserData,
  sounds: ISounds,
) {
  ballData.x += ballData.velocityX;
  ballData.y += ballData.velocityY;

  if (user1.y < thickness + ballData.radius * slit) {
    user1.y = thickness + ballData.radius * slit;
  } else if (
    user1.y >
    canvas.height - thickness - user1.height - ballData.radius * slit
  ) {
    user1.y = canvas.height - thickness - user1.height - ballData.radius * slit;
  }

  if (
    ballData.y - ballData.radius - thickness < 0 ||
    ballData.y + ballData.radius + thickness > canvas.height
  ) {
    ballData.velocityY = -ballData.velocityY;
    sounds.wall.play().catch(function (error: any) {
      // console.log("Chrome cannot play sound without user interaction first");
    });
  }

  if (ballData.x + ballData.radius < 0 && !ballData.reset) {
    let { newBallData, newUserData1, newUserData2 } = resetBall(
      canvas,
      ballData,
      user1,
      user2,
    );
    ballData = newBallData;
    user1 = newUserData1;
    user2 = newUserData2;
  } else if (ballData.x - ballData.radius > canvas.width && !ballData.reset) {
    user1.score++;
    sounds.userScore.play().catch(function (error: any) {
      // console.log("Chrome cannot play sound without user interaction first");
    });
    let { newBallData, newUserData1, newUserData2 } = resetBall(
      canvas,
      ballData,
      user1,
      user2,
    );
    ballData = newBallData;
    user1 = newUserData1;
    user2 = newUserData2;
  }

  let player: IUserData =
    ballData.x + ballData.radius < canvas.width / 2 ? user1 : user2;

  if (checkCollision(ballData, player)) {
    sounds.hit.play().catch(function (error: any) {
      // console.log("Chrome cannot play sound without user interaction first");
    });
    let collidePoint = ballData.y - (player.y + player.height / 2);
    collidePoint = collidePoint / (player.height / 2);

    let angleRad = (Math.PI / 4) * collidePoint;

    let direction = ballData.x + ballData.radius < canvas.width / 2 ? 1 : -1;
    ballData.velocityX = direction * ballData.speed * Math.cos(angleRad);
    ballData.velocityY = ballData.speed * Math.sin(angleRad);

    ballData.speed += 0.1;
    user1.height -= 2;
    user2.height -= 2;
  }
}

function matchUser2(
  canvas: HTMLCanvasElement,
  ballData: IBallData,
  user1: IUserData,
  user2: IUserData,
  sounds: ISounds,
) {
  ballData.x += ballData.velocityX;
  ballData.y += ballData.velocityY;

  //user2.y += (ballData.y - (user2.y + user2.height / 2)) * 0.1;
  if (user2.y < thickness + ballData.radius * slit) {
    user2.y = thickness + ballData.radius * slit;
  } else if (
    user2.y >
    canvas.height - thickness - user2.height - ballData.radius * slit
  ) {
    user2.y = canvas.height - thickness - user2.height - ballData.radius * slit;
  }

  if (
    ballData.y - ballData.radius - thickness < 0 ||
    ballData.y + ballData.radius + thickness > canvas.height
  ) {
    ballData.velocityY = -ballData.velocityY;
  }

  if (ballData.x + ballData.radius < 0 && !ballData.reset) {
    user2.score++;
    sounds.userScore.play().catch(function (error: any) {
      // console.log("Chrome cannot play sound without user interaction first");
    });
    let { newBallData } = resetBall(canvas, ballData, user1, user2);
    ballData = newBallData;
  } else if (ballData.x - ballData.radius > canvas.width && !ballData.reset) {
    let { newBallData } = resetBall(canvas, ballData, user1, user2);
    ballData = newBallData;
  }

  let player: IUserData =
    ballData.x + ballData.radius < canvas.width / 2 ? user1 : user2;

  if (checkCollision(ballData, player)) {
    sounds.hit.play().catch(function (error: any) {
      // console.log("Chrome cannot play sound without user interaction first");
    });
    let collidePoint = ballData.y - (player.y + player.height / 2);
    collidePoint = collidePoint / (player.height / 2);

    let angleRad = (Math.PI / 4) * collidePoint;

    let direction = ballData.x + ballData.radius < canvas.width / 2 ? 1 : -1;
    ballData.velocityX = direction * ballData.speed * Math.cos(angleRad);
    ballData.velocityY = ballData.speed * Math.sin(angleRad);

    ballData.speed += 0.1;
    user1.height -= 2;
    user2.height -= 2;
  }
}

function resetBall(
  canvas: { width: number; height: number },
  ballData: IBallData,
  user1: IUserData,
  user2: IUserData,
) {
  const newBallData: IBallData = ballData;
  const newUserData1: IUserData = user1;
  const newUserData2: IUserData = user2;
  newBallData.reset = true;

  setTimeout(() => {
    newBallData.x = canvas.width / 2;
    newBallData.y = canvas.height / 2;
    // eslint-disable-next-line no-self-assign
    newBallData.velocityX = newBallData.velocityX;
    newBallData.velocityY = -newBallData.velocityY * Math.random();
    newBallData.speed = userSpeedInput;
    newUserData1.height = 100;
    newUserData2.height = 100;
    newBallData.reset = false;
  }, 1500);

  return { newBallData, newUserData1, newUserData2 };
}

function render(
  canvas: HTMLCanvasElement,
  ballData: {
    x: number;
    y: number;
    radius: number;
    velocityX?: number;
    velocityY?: number;
    speed: number;
    reset?: boolean;
    color: RenderColor;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  },
  user1: {
    x: number;
    y: number;
    width: number;
    height: number;
    score: number;
    color: RenderColor;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  },
  user2: {
    x: number;
    y: number;
    width: number;
    height: number;
    score: number;
    color: RenderColor;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  },
  net: INetData,
  match_points: number,
  usersData: { user1: GameSessionUser; user2: GameSessionUser },
  isPlayer1: boolean,
) {
  drawRect(canvas, 0, 0, canvas.width, canvas.height, RenderColor.Black);

  drawRect(canvas, 0, 0, canvas.width, thickness, RenderColor.White);

  drawRect(
    canvas,
    0,
    canvas.height - thickness,
    canvas.width,
    thickness,
    RenderColor.White,
  );

  drawDashedLine(canvas, net);

  drawRect(canvas, user1.x, user1.y, user1.width, user1.height, user1.color);

  drawRect(canvas, user2.x, user2.y, user2.width, user2.height, user2.color);

  drawArc(canvas, ballData.x, ballData.y, ballData.radius, ballData.color);

  drawText(
    canvas,
    usersData.user1.username,
    (canvas.width / 10) * 4,
    canvas.height / 10,
    '20px Arial',
    'right',
    RenderColor.Yellow,
  );

  drawText(
    canvas,
    String(user1.score),
    (canvas.width / 10) * 4,
    canvas.height / 6,
    '40px Arial',
    'right',
    RenderColor.Red,
  );

  drawText(
    canvas,
    usersData.user2.username,
    (canvas.width / 10) * 6,
    canvas.height / 10,
    '20px Arial',
    'left',
    RenderColor.Yellow,
  );

  drawText(
    canvas,
    String(user2.score),
    (canvas.width / 10) * 6,
    canvas.height / 6,
    '40px Arial',
    'left',
    RenderColor.Red,
  );

  if (user1.score >= match_points) {
    drawText(
      canvas,
      '🏆',
      (canvas.width / 10) * 4,
      canvas.height / 4.5,
      '30px Arial',
      'right',
      RenderColor.Green,
    );

    drawRect(canvas, 200, 200, 500, 150, RenderColor.Grey);

    drawText(
      canvas,
      'GAME OVER',
      450,
      300,
      '60px Verdana',
      'center',
      RenderColor.Red,
    );

    drawRect(canvas, 200, 360, 500, 80, RenderColor.White);

    drawText(
      canvas,
      usersData.user1.username + ' wins',
      450,
      410,
      '40px Verdana',
      'center',
      RenderColor.Green,
    );
  }

  if (user2.score >= match_points) {
    drawText(
      canvas,
      '🏆',
      (canvas.width / 10) * 6,
      canvas.height / 4.5,
      '30px Arial',
      'left',
      RenderColor.Green,
    );

    if (user1.score >= match_points || user2.score >= match_points) {
      drawRect(canvas, 200, 200, 500, 150, RenderColor.Grey);

      drawText(
        canvas,
        'GAME OVER',
        450,
        300,
        '60px Verdana',
        'center',
        RenderColor.Red,
      );

      drawRect(canvas, 200, 360, 500, 80, RenderColor.White);

      if (user1.score >= match_points) {
        drawText(
          canvas,
          usersData.user1.username + ' wins',
          450,
          410,
          '40px Verdana',
          'center',
          RenderColor.Green,
        );
      } else {
        drawText(
          canvas,
          usersData.user2.username + ' wins',
          450,
          410,
          '40px Verdana',
          'center',
          RenderColor.Green,
        );
      }
    }
  }

  const speedRender: number = ballData.speed * 0.1;

  drawText(
    canvas,
    'Ball Speed: X' + speedRender.toFixed(2),
    (canvas.width / 10) * 4.5,
    (canvas.height / 20) * 19,
    '15px Arial',
    'right',
    RenderColor.Grey,
  );

  drawText(
    canvas,
    'Paddle Height: ' + user1.height + '%',
    (canvas.width / 10) * 5.5,
    (canvas.height / 20) * 19,
    '15px Arial',
    'left',
    RenderColor.Grey,
  );
}

function onGameEnd(
  canvas: HTMLCanvasElement,
  eventList: any[],
  socket: Socket,
  sessionId: string,
  player: IUserData,
  intraId: number,
) {
  // TODO check this, looks like it's not working
  eventList.forEach(function ({ typeEvent, handler }) {
    canvas.removeEventListener(typeEvent, handler);
  });

  let endGamePayload: IEndGamePayload = {
    gameDataId: sessionId,
    startedAt,
    elapsedTime: new Date().getTime() - startedAt.getTime(),
    player: {
      intraId,
      score: player.score,
      isWinner: player.score >= match_points,
    },
  };

  socket.emit('endGame', JSON.stringify(endGamePayload));
}

export async function gameLoop(
  canvas: HTMLCanvasElement,
  socket: Socket<DefaultEventsMap, DefaultEventsMap>,
  isPlayer1: boolean,
  sessionId: string | null,
  usersData: { user1: GameSessionUser; user2: GameSessionUser },
) {
  // Update initial data
  let ballData = {
    ...ballDataInit,
    x: canvas.width / 2,
    y: canvas.height / 2,
  };

  let user1 = { ...user1Init, y: canvas.height / 2 - 100 / 2 };

  let user2 = {
    ...user2Init,
    x: canvas.width - 40,
    y: canvas.height / 2 - 100 / 2,
  };

  let net = { ...netInit, x: canvas.width / 2 - 5 };

  if (isPlayer1) {
    socket.emit(
      'upload',
      JSON.stringify({
        isUser1: true,
        gameDataId: sessionId,
        ball: ballData,
        user1,
        user2,
      }),
    );
  } else {
    socket.emit(
      'upload',
      JSON.stringify({
        isUser1: false,
        gameDataId: sessionId,
        ball: ballData,
        user1,
        user2,
      }),
    );
  }

  // Logic
  const { hit, wall, userScore, botScore } = initializeSounds();
  const sounds = {
    hit,
    wall,
    userScore,
    botScore,
  };

  function onKeyDown(event: KeyboardEvent) {
    if (isPlayer1) {
      if (event.keyCode === 38) {
        // UP ARROW key
        user1.y -= userSpeedInput * 5;
      } else if (event.keyCode === 40) {
        // DOWN ARROW key
        user1.y += userSpeedInput * 5;
      }
    }
    if (!isPlayer1) {
      if (event.keyCode === 38) {
        // UP ARROW key
        user2.y -= userSpeedInput * 5;
      } else if (event.keyCode === 40) {
        // DOWN ARROW key
        user2.y += userSpeedInput * 5;
      }
    }
  }
  canvas.addEventListener('keydown', onKeyDown);

  function onMouseMove(event: MouseEvent) {
    if (isPlayer1) {
      let rect = canvas.getBoundingClientRect();
      user1.y = event.clientY - rect.top - user1.height / 2;
      if (user1.y < thickness + ballData.radius * slit) {
        user1.y = thickness + ballData.radius * slit;
      } else if (
        user1.y >
        canvas.height - thickness - user1.height - ballData.radius * slit
      ) {
        user1.y =
          canvas.height - thickness - user1.height - ballData.radius * slit;
      }
    }
    if (!isPlayer1) {
      let rect = canvas.getBoundingClientRect();
      user2.y = event.clientY - rect.top - user2.height / 2;
      if (user2.y < thickness + ballData.radius * slit) {
        user2.y = thickness + ballData.radius * slit;
      } else if (
        user2.y >
        canvas.height - thickness - user1.height - ballData.radius * slit
      ) {
        user2.y =
          canvas.height - thickness - user1.height - ballData.radius * slit;
      }
    }
  }
  canvas.addEventListener('mousemove', onMouseMove);

  function onTouchStart(event: TouchEvent) {
    const touch = event.touches[0];
    user1.y = touch.clientY - user1.height / 2;
    if (user1.y < thickness + ballData.radius * slit) {
      user1.y = thickness + ballData.radius * slit;
    } else if (
      user1.y >
      canvas.height - thickness - user1.height - ballData.radius * slit
    ) {
      user1.y =
        canvas.height - thickness - user1.height - ballData.radius * slit;
    }
  }
  canvas.addEventListener('touchstart', onTouchStart);

  const eventList = [
    { typeEvent: 'keydown', handler: onKeyDown },
    { typeEvent: 'mousemove', handler: onMouseMove },
    { typeEvent: 'touchstart', handler: onTouchStart },
  ];

  if (isPlayer1) {
    socket.on(`downloaded/user1/${sessionId}`, (data: string) => {
      const downloadedData = JSON.parse(data);
      user2 = downloadedData.user2;

      if (user2.score >= match_points || user1.score >= match_points) {
        if (!match_finish)
          onGameEnd(
            canvas,
            eventList,
            socket,
            sessionId!,
            user1,
            usersData.user1.intraId,
          );
        match_finish = true;
      }

      matchUser1(canvas, ballData, user1, user2, sounds);

      render(
        canvas,
        ballData,
        user1,
        user2,
        net,
        match_points,
        usersData,
        isPlayer1,
      );

      socket.emit(
        'upload',
        JSON.stringify({
          isUser1: true,
          gameDataId: sessionId,
          ball: ballData,
          user1,
        }),
      );
    });
  } else {
    socket.on(`downloaded/user2/${sessionId}`, (data: string) => {
      const downloadedData = JSON.parse(data);
      ballData = downloadedData.ball;
      user1 = downloadedData.user1;

      if (user1.score >= match_points || user2.score >= match_points) {
        if (!match_finish)
          onGameEnd(
            canvas,
            eventList,
            socket,
            sessionId!,
            user2,
            usersData.user2.intraId,
          );
        match_finish = true;
      }

      matchUser2(canvas, ballData, user1, user2, sounds);

      render(
        canvas,
        ballData,
        user1,
        user2,
        net,
        match_points,
        usersData,
        isPlayer1,
      );

      socket.emit(
        'upload',
        JSON.stringify({ isUser1: false, gameDataId: sessionId, user2 }),
      );
    });
  }

  setTimeout(() => {
    game(socket, isPlayer1, match_points, sessionId);
  }, 1000);
}
