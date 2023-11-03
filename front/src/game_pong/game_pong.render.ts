import { Socket } from 'socket.io-client';
import GameSessionUser from '../interfaces/game-session-user.interface';
import UserData from '../interfaces/user-data.interface';
import { matchPoints, slit, thickness } from './game_pong';
import { userSpeedInput } from './game_pong.constants';
import {
  InitializeCanvasImages,
  ballTrailClean,
  checkCollision,
  drawBall,
  drawBallTrail,
  drawDashedLine,
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
  sounds: any,
) {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  // To clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //Background
  drawRect(canvas, 0, 0, canvas.width, canvas.height, RenderColor.Black);

  // drawImg(
  //   canvas,
  //   canvasImages.canvasBgImage,
  //   0,
  //   0,
  //   canvas.width,
  //   canvas.height,
  // );

  // Above wall
  drawRect(canvas, 0, 0, canvas.width, thickness, RenderColor.White);

  // Below wall
  drawRect(
    canvas,
    0,
    canvas.height - thickness,
    canvas.width,
    thickness,
    RenderColor.White,
  );

  // Net line
  drawDashedLine(canvas, net);

  // Paddle user1
  drawRect(canvas, user1.x, user1.y, user1.width, user1.height, user1.color);

  //Paddle user2
  drawRect(canvas, user2.x, user2.y, user2.width, user2.height, user2.color);

  //Ball
  drawBall(canvas, ballData.x, ballData.y, ballData.radius, ballData.color);

  drawBallTrail(canvas, 0.05);

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

  if (isSoloMode(usersData)) {
    drawText(
      canvas,
      'BOT',
      (canvas.width / 10) * 6,
      canvas.height / 10,
      '20px Arial',
      'left',
      RenderColor.Yellow,
    );
  } else {
    drawText(
      canvas,
      usersData.user2!.username,
      (canvas.width / 10) * 6,
      canvas.height / 10,
      '20px Arial',
      'left',
      RenderColor.Yellow,
    );
  }

  drawText(
    canvas,
    String(user2.score),
    (canvas.width / 10) * 6,
    canvas.height / 6,
    '40px Arial',
    'left',
    RenderColor.Red,
  );

  if (user1.score >= matchPoints) {
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

  if (user2.score >= matchPoints) {
    drawText(
      canvas,
      '🏆',
      (canvas.width / 10) * 6,
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

// Reset ball to initial values when each point starts
export function resetBall(
  canvas: HTMLCanvasElement,
  ballData: IBallData,
  user1: IUserData,
  user2: IUserData,
  userSpeedInput: number,
) {
  const newBallData: IBallData = ballData;
  const newUserData1: IUserData = user1;
  const newUserData2: IUserData = user2;
  newBallData.reset = true;

  // TODO Check setTimeout (async / await)
  setTimeout(() => {
    newBallData.x = canvas.width / 2;
    newBallData.y = canvas.height / 2;
    newBallData.moveX = newBallData.moveX * 1;
    newBallData.moveY = -newBallData.moveY * Math.random();
    newBallData.speed = userSpeedInput;
    newUserData1.height = 100;
    newUserData2.height = 100;
    newBallData.reset = false;
  }, 2000);

  // drawText(
  //   canvas,
  //   'reloj',
  //   canvas.width / 2,
  //   canvas.height / 2,
  //   '20px Arial',
  //   'center',
  //   RenderColor.White,
  // );

  return { newBallData, newUserData1, newUserData2 };
}

export function matchUser1(
  canvas: HTMLCanvasElement,
  ballData: IBallData,
  user1: IUserData,
  user2: IUserData,
  sounds: ISounds,
) {
  // Ball motion
  ballData.x += ballData.moveX;
  ballData.y += ballData.moveY;

  // Limit paddle vertical motion
  if (user1.y < thickness + ballData.radius * slit) {
    user1.y = thickness + ballData.radius * slit;
  } else if (
    user1.y >
    canvas.height - thickness - user1.height - ballData.radius * slit
  ) {
    user1.y = canvas.height - thickness - user1.height - ballData.radius * slit;
  }

  // Change direction of ball motion when it hits walls
  if (
    ballData.y - ballData.radius - thickness < 0 ||
    ballData.y + ballData.radius + thickness > canvas.height
  ) {
    ballData.moveY = -ballData.moveY;
  }

  // Check if ball pass the goal line & increase user score
  // If a goal is scored, the ball & paddle are reset to initial values
  // if (ballData.x + ballData.radius < 15 && !ballData.reset) {
  //   user2.score++;
  //   sounds.botScore.play().catch(function (error: any) {});
  //   let { newBallData, newUserData1, newUserData2 } = resetBall(
  //     canvas,
  //     ballData,
  //     user1,
  //     user2,
  //     userSpeedInput,
  //   );
  //   ballData = newBallData;
  //   user1 = newUserData1;
  //   user2 = newUserData2;
  // }

  if (ballData.x - ballData.radius > canvas.width - 15 && !ballData.reset) {
    user1.score++;
    sounds.botScore.play().catch(function (error: any) {});
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

  // Detect if the ball is in the court of user1 or user2
  let player: IUserData =
    ballData.x + ballData.radius < canvas.width / 2 ? user1 : user2;

  // Detect if the ball hits the paddle & bounce the ball
  if (checkCollision(ballData, player)) {
    // Detect the point where the ball hits in the paddle
    let collidePoint = ballData.y - (player.y + player.height / 2);
    collidePoint = collidePoint / (player.height / 2);

    let angleRad = (Math.PI / 4) * collidePoint;

    // Get direction to bounce the ball
    let direction = ballData.x + ballData.radius < canvas.width / 2 ? 1 : -1;
    ballData.moveX = direction * ballData.speed * Math.cos(angleRad);
    ballData.moveY = ballData.speed * Math.sin(angleRad);

    // Modify values to make it more difficult
    ballData.speed += 0.1;
    user1.height -= 2;
    user2.height -= 2;

    sounds.hit.play().catch(function (error: any) {});

    // Sparks effect when the ball hits the paddle
    sparks(
      canvas,
      ballData.x,
      ballData.y,
      ballData.radius,
      RenderColor.Yellow,
      50,
      1,
    );
  }
}

export function matchUser2(
  canvas: HTMLCanvasElement,
  ballData: IBallData,
  user1: IUserData,
  user2: IUserData,
  sounds: ISounds,
  isSoloMode: boolean = false,
) {
  // Paddle motion in 1 player mode (bot movements)
  if (isSoloMode) {
    user2.y += (ballData.y - (user2.y + user2.height / 2)) * 0.1;
  }

  // Limit paddle vertical motion
  if (user2.y < thickness + ballData.radius * slit) {
    user2.y = thickness + ballData.radius * slit;
  } else if (
    user2.y >
    canvas.height - thickness - user2.height - ballData.radius * slit
  ) {
    user2.y = canvas.height - thickness - user2.height - ballData.radius * slit;
  }

  // Check if ball pass the goal line & increase user score
  // If a goal is scored, the ball & paddle are reset to initial values
  if (ballData.x + ballData.radius < 15 && !ballData.reset) {
    user2.score++;
    sounds.botScore.play().catch(function (error: any) {});
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

  // if (ballData.x + ballData.radius > canvas.width - 15 && !ballData.reset) {
  //   user1.score++;
  //   sounds.botScore.play().catch(function (error: any) {});
  //   console.log('Sound');
  //   let { newBallData, newUserData1, newUserData2 } = resetBall(
  //     canvas,
  //     ballData,
  //     user1,
  //     user2,
  //     userSpeedInput,
  //   );
  //   ballData = newBallData;
  //   user1 = newUserData1;
  //   user2 = newUserData2;
  // }

  // Detect if the ball is in the court of user1 or user2
  // let player: IUserData =
  //   ballData.x + ballData.radius < canvas.width / 2 ? user1 : user2;

  // // Detect if the ball hits the paddle & bounce the ball
  // if (checkCollision(ballData, player)) {
  //   sounds.hit.play().catch(function (error: any) {});

  //   // Detect the point where the ball hits in the paddle
  //   let collidePoint = ballData.y - (player.y + player.height / 2);
  //   collidePoint = collidePoint / (player.height / 2);

  //   let angleRad = (Math.PI / 4) * collidePoint;

  //   // Get direction to bounce the ball
  //   let direction = ballData.x + ballData.radius < canvas.width / 2 ? 1 : -1;
  //   ballData.moveX = direction * ballData.speed * Math.cos(angleRad);
  //   ballData.moveY = ballData.speed * Math.sin(angleRad);

  //   // Modify values to make it more difficult
  //   ballData.speed += 0.1;
  //   user1.height -= 2;
  //   user2.height -= 2;

  //   //   // Sparks effect when the ball hits the paddle
  //   //   sparks(canvas, ballData.x, ballData.y, ballData.radius, RenderColor.Yellow);
  // }
}

type OnGameEndArgs = {
  canvas: HTMLCanvasElement;
  eventList: any[];
  socket: Socket;
  sessionId: string;
  startedAt: Date;
  player: IUserData;
  userData: any;
  sounds: any;
  isAbortedMatch?: boolean;
};
export function onGameEnd({
  canvas,
  eventList,
  socket,
  sessionId,
  startedAt,
  player,
  userData,
  sounds,
  isAbortedMatch = false,
}: OnGameEndArgs) {
  // TODO check this, looks like it's not working
  eventList.forEach(function ({ typeEvent, handler }) {
    canvas.removeEventListener(typeEvent, handler);
  });

  sounds.music.stop = function () {
    this.pause();
    this.currentTime = 0;
  };
  sounds.music.stop();

  ballTrailClean();

  // In case of aborted match
  // We don't want to send match data to the API
  if (!isAbortedMatch) {
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
}
