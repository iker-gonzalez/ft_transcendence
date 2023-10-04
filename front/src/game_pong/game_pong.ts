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
  INetData,
  ISounds,
  IUserData,
  RenderColor,
} from './game_pong.interfaces';

const fps = 60;
const computedFps = 1000 / fps;
const thickness = 10;
const slit = 3;
const userSpeedInput = 10;

function game(
  canvas: any,
  socket: { emit: (arg0: string, arg1: string) => void },
  isPlayer1: boolean,
  ballData: IBallData,
  user1: IUserData,
  user2: IUserData,
  net: INetData,
  match_finish: boolean,
  match_points: number,
  sounds: ISounds,
  sessionId: any,
) {
  if (!match_finish) {
    if (isPlayer1) {
      socket.emit(
        'download',
        JSON.stringify({
          isUser1: true,
          gameDataId: sessionId,
        }),
      );
    } else {
      socket.emit(
        'download',
        JSON.stringify({
          isUser1: false,
          gameDataId: sessionId,
        }),
      );
    }

    setTimeout(() => {
      requestAnimationFrame(function () {
        game(
          canvas,
          socket,
          isPlayer1,
          ballData,
          user1,
          user2,
          net,
          match_finish,
          match_points,
          sounds,
          sessionId,
        );
      });
    }, computedFps);
  }
}

function matchUser1(
  canvas: { height: number; width: number },
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
    let { newBallData, newUserData } = resetBall(canvas, ballData, user1);
    ballData = newBallData;
    user1 = newUserData;
  } else if (ballData.x - ballData.radius > canvas.width && !ballData.reset) {
    user1.score++;
    sounds.userScore.play().catch(function (error: any) {
      // console.log("Chrome cannot play sound without user interaction first");
    });
    let { newBallData, newUserData } = resetBall(canvas, ballData, user1);
    ballData = newBallData;
    user1 = newUserData;
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
  }
}

function matchUser2(
  canvas: { height: number; width: number },
  ballData: IBallData,
  user1: IUserData,
  user2: IUserData,
  sounds: ISounds,
) {
  ballData.x += ballData.velocityX;
  ballData.y += ballData.velocityY;

  user2.y += (ballData.y - (user2.y + user2.height / 2)) * 0.1;
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
    let { newBallData } = resetBall(canvas, ballData, user1);
    ballData = newBallData;
  } else if (ballData.x - ballData.radius > canvas.width && !ballData.reset) {
    let { newBallData } = resetBall(canvas, ballData, user1);
    ballData = newBallData;
  }

  let player = ballData.x + ballData.radius < canvas.width / 2 ? user1 : user2;

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
  }
}

function resetBall(
  canvas: { width: number; height: number },
  ballData: any,
  user1: any,
) {
  const newBallData = ballData;
  const newUserData = user1;
  newBallData.reset = true;

  setTimeout(() => {
    newBallData.x = canvas.width / 2;
    newBallData.y = canvas.height / 2;
    // eslint-disable-next-line no-self-assign
    newBallData.velocityX = newBallData.velocityX;
    newBallData.velocityY = -newBallData.velocityY * Math.random();
    newBallData.speed = userSpeedInput;
    newUserData.height = 100;
    newBallData.reset = false;
  }, 1500);

  return { newBallData, newUserData };
}

function render(
  canvas: HTMLCanvasElement,
  ballData: {
    x: any;
    y: any;
    radius: any;
    velocityX?: number;
    velocityY?: number;
    speed: any;
    reset?: boolean;
    color: any;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  },
  user1: {
    y: any;
    width: any;
    height: any;
    score: any;
    x: any;
    color: any;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  },
  user2: {
    x: any;
    y: any;
    width: any;
    height: any;
    score: any;
    color: any;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  },
  net: INetData,
  match_finish: boolean,
  match_points: number,
) {
  drawRect(canvas, 0, 0, canvas.width, canvas.height, RenderColor.Black);

  drawText(
    canvas,
    'USER_1',
    (canvas.width / 10) * 4,
    canvas.height / 10,
    '10px Arial',
    'right',
    RenderColor.Yellow,
  );
  drawText(
    canvas,
    user1.score,
    (canvas.width / 10) * 4,
    canvas.height / 6,
    '40px Arial',
    'right',
    RenderColor.Red,
  );
  if (user1.score >= match_points) {
    match_finish = true;
    drawText(
      canvas,
      '🏆 WINNER',
      (canvas.width / 10) * 4,
      canvas.height / 4.5,
      '30px Arial',
      'right',
      RenderColor.Green,
    );
    setTimeout(() => {
      alert('⭐️ USER 1 WINS ⭐️');
    }, 10);
  }

  drawText(
    canvas,
    'COMPUTER_BOT',
    (canvas.width / 10) * 6,
    canvas.height / 10,
    '10px Arial',
    'left',
    RenderColor.Yellow,
  );
  drawText(
    canvas,
    user2.score,
    (canvas.width / 10) * 6,
    canvas.height / 6,
    '40px Arial',
    'left',
    RenderColor.Red,
  );
  if (user2.score >= match_points) {
    match_finish = true;
    drawText(
      canvas,
      '🏆 WINNER',
      (canvas.width / 10) * 6,
      canvas.height / 4.5,
      '30px Arial',
      'left',
      RenderColor.Green,
    );
    setTimeout(() => {
      alert('⭐️ USER 2 WINS ⭐️');
    }, 10);
  }

  drawText(
    canvas,
    'Ball Speed: ' + ballData.speed?.toFixed(2),
    (canvas.width / 10) * 7,
    (canvas.height / 20) * 17,
    '15px Arial',
    'left',
    RenderColor.Grey,
  );

  drawText(
    canvas,
    'Paddle Height: ' + user1.height,
    (canvas.width / 10) * 7,
    (canvas.height / 20) * 18,
    '15px Arial',
    'left',
    RenderColor.Grey,
  );

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
}

export async function gameLoop(
  canvas: HTMLCanvasElement,
  socket: Socket<DefaultEventsMap, DefaultEventsMap>,
  isPlayer1: boolean,
  sessionId: string | null,
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
  let match_points = 5;
  let match_finish = false;

  const { hit, wall, userScore, botScore } = initializeSounds();
  const sounds = {
    hit,
    wall,
    userScore,
    botScore,
  };

  document.addEventListener('keydown', function (event) {
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
  });

  canvas.addEventListener('mousemove', function (event: { clientY: number }) {
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
  });

  canvas.addEventListener('touchstart', function (event: TouchEvent) {
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
  });

  if (isPlayer1) {
    socket.on(`downloaded/user1/${sessionId}`, (data: string) => {
      const downloadedData = JSON.parse(data);
      user2 = downloadedData.user2;

      matchUser1(canvas, ballData, user1, user2, sounds);

      render(canvas, ballData, user1, user2, net, match_finish, match_points);

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

      matchUser2(canvas, ballData, user1, user2, sounds);

      render(canvas, ballData, user1, user2, net, match_finish, match_points);

      socket.emit(
        'upload',
        JSON.stringify({ isUser1: false, gameDataId: sessionId, user2 }),
      );
    });
  }

  setTimeout(() => {
    game(
      canvas,
      socket,
      isPlayer1,
      ballData,
      user1,
      user2,
      net,
      match_finish,
      match_points,
      sounds,
      sessionId,
    );
  }, 1000);
}
