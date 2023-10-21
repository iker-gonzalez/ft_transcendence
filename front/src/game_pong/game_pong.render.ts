import { Socket } from 'socket.io-client';
import GameSessionUser from '../interfaces/game-session-user.interface';
import UserData from '../interfaces/user-data.interface';
import { matchPoints, slit, thickness } from './game_pong';
import { userSpeedInput } from './game_pong.constants';
import {
  InitializeCanvasImages,
  checkCollision,
  drawBall,
  drawBallTrail,
  drawDashedLine,
  drawImg,
  drawRect,
  drawText,
  isSoloMode,
  sparks,
} from './game_pong.functions';
import {
  IBallData,
  IEndGamePayload,
  INetData,
  ISounds,
  IUserData,
  RenderColor,
} from './game_pong.interfaces';
import { startedAt } from './game_pong';

export function render(
  canvas: HTMLCanvasElement,
  ballData: IBallData,
  user1: IUserData,
  user2: IUserData,
  net: INetData,
  matchPoints: number,
  usersData: {
    user1: GameSessionUser | UserData;
    user2?: GameSessionUser | UserData;
  },
  canvasImages: InitializeCanvasImages,
  thickness: number,
) {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  // To clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawRect(canvas, 0, 0, canvas.width, canvas.height, RenderColor.Black);
  
  // drawImg(
  //   canvas,
  //   canvasImages.canvasBgImage,
  //   0,
  //   0,
  //   canvas.width,
  //   canvas.height,
  // );

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

  drawBall(canvas, ballData.x, ballData.y, ballData.radius, ballData.color);

  drawBallTrail(canvas);

  drawText(
    canvas,
    usersData.user1.username,
    canvas.width / 10 * 4,
    canvas.height / 10,
    '20px Arial',
    'right',
    RenderColor.Yellow,
  );

  drawText(
    canvas,
    String(user1.score),
    canvas.width / 10 * 4,
    canvas.height / 6,
    '40px Arial',
    'right',
    RenderColor.Red,
  );

  if (isSoloMode(usersData)) {
    drawText(
      canvas,
      'BOT',
      canvas.width / 10 * 6,
      canvas.height / 10,
      '20px Arial',
      'left',
      RenderColor.Yellow,
    );
  } else {
    drawText(
      canvas,
      usersData.user2!.username,
      canvas.width / 10 * 6,
      canvas.height / 10,
      '20px Arial',
      'left',
      RenderColor.Yellow,
    );
  }

  drawText(
    canvas,
    String(user2.score),
    canvas.width / 10 * 6,
    canvas.height / 6,
    '40px Arial',
    'left',
    RenderColor.Red,
  );

  if (user1.score >= matchPoints) {
    drawText(
      canvas,
      '🏆',
      canvas.width / 10 * 4,
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

  if (user2.score >= matchPoints) {
    drawText(
      canvas,
      '🏆',
      canvas.width / 10 * 6,
      canvas.height / 4.5,
      '30px Arial',
      'left',
      RenderColor.Green,
    );

    if (user1.score >= matchPoints || user2.score >= matchPoints) {
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

      if (user1.score >= matchPoints) {
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
        if (isSoloMode(usersData)) {
          drawText(
            canvas,
            'BOT wins',
            450,
            410,
            '40px Verdana',
            'center',
            RenderColor.Green,
          );
        } else {
          drawText(
            canvas,
            usersData.user2!.username + ' wins',
            450,
            410,
            '40px Verdana',
            'center',
            RenderColor.Green,
          );
        }
      }
    }
  }

  const speedRender: number = ballData.speed * 0.1;

  drawText(
    canvas,
    'Ball Speed: X' + speedRender.toFixed(2),
    canvas.width / 10 * 4.5,
    canvas.height / 20 * 19,
    '15px Arial',
    'right',
    RenderColor.Grey,
  );

  drawText(
    canvas,
    'Paddle Height: ' + user1.height + '%',
    canvas.width / 10 * 5.5,
    canvas.height / 20 * 19,
    '15px Arial',
    'left',
    RenderColor.Grey,
  );
}

export function resetBall(
  canvas: { width: number; height: number },
  ballData: IBallData,
  user1: IUserData,
  user2: IUserData,
  userSpeedInput: number,
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

export function matchUser2(
  canvas: HTMLCanvasElement,
  ballData: IBallData,
  user1: IUserData,
  user2: IUserData,
  sounds: ISounds,
  isSoloMode: boolean = false,
) {
  ballData.x += ballData.velocityX;
  ballData.y += ballData.velocityY;

  if (isSoloMode) {
    user2.y += (ballData.y - (user2.y + user2.height / 2)) * 0.1;
  }

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
    let { newBallData } = resetBall(
      canvas,
      ballData,
      user1,
      user2,
      userSpeedInput,
    );
    ballData = newBallData;
  } else if (ballData.x - ballData.radius > canvas.width && !ballData.reset) {
    let { newBallData } = resetBall(
      canvas,
      ballData,
      user1,
      user2,
      userSpeedInput,
    );
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

export function matchUser1(
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
      userSpeedInput,
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
      userSpeedInput,
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
    sparks(canvas, ballData.x, ballData.y, ballData.radius, RenderColor.Yellow);
  }
}

export function onGameEnd(
  canvas: HTMLCanvasElement,
  eventList: any[],
  socket: Socket,
  sessionId: string,
  player: IUserData,
  userData: any,
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
      avatar: userData.avatar,
      intraId: userData.intraId,
      isWinner: player.score >= matchPoints,
      score: player.score,
      username: userData.username,
    },
  };

  socket.emit('endGame', JSON.stringify(endGamePayload));
}