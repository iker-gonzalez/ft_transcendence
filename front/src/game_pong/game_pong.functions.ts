import GameSessionUser from '../interfaces/game-session-user.interface';
import UserData from '../interfaces/user-data.interface';
import {
  IBallData,
  INetData,
  ISounds,
  IUserData,
  RenderColor,
} from './game_pong.interfaces';
import hitSound from './sounds/hit.wav';
import wallSound from './sounds/punch.wav';
import userScoreSound from './sounds/strike.wav';
import botScoreSound from './sounds/goal.wav';
import BgImageGrass from './images/grass.jpg';

export function drawRect(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
  color: RenderColor,
): void {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

export function drawArc(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  r: number,
  color: RenderColor,
): void {
  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
}

export function drawDashedLine(canvas: HTMLCanvasElement, net: INetData): void {
  for (let i = 0; i <= canvas.height; i += 20) {
    drawRect(canvas, net.x, net.y + i, net.width, net.height, net.color);
  }
}

export function drawText(
  canvas: HTMLCanvasElement,
  text: string,
  x: number,
  y: number,
  font: string,
  align: CanvasTextAlign,
  color: RenderColor,
): void {
  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.font = font;
  ctx.fillText(text, x, y);
}

export function drawImg(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  if (!ctx) return;

  // So that background image is not render over the ball
  ctx.globalCompositeOperation = 'destination-over';
  ctx.drawImage(img, x, y, w, h);
  ctx.globalCompositeOperation = 'source-over';
}

export function checkCollision(b: IBallData, p: IUserData): boolean {
  b.top = b.y - b.radius;
  b.bottom = b.y + b.radius;
  b.left = b.x - b.radius;
  b.right = b.x + b.radius;

  p.top = p.y;
  p.bottom = p.y + p.height;
  p.left = p.x;
  p.right = p.x + p.width;

  return (
    p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top
  );
}

export function initializeSounds(): ISounds {
  let hit = new Audio(hitSound);
  let wall = new Audio(wallSound);
  let userScore = new Audio(userScoreSound);
  let botScore = new Audio(botScoreSound);

  return { hit, wall, userScore, botScore };
}

export function isSoloMode(usersData: {
  user1: GameSessionUser | UserData;
  user2?: GameSessionUser | UserData;
}): boolean {
  return !Boolean(usersData.user2);
}

export type InitializeCanvasImages = {
  canvasBgImage: HTMLImageElement;
};
export function initializeCanvasImages(): InitializeCanvasImages {
  const canvasBgImage: HTMLImageElement = new Image();
  canvasBgImage.src = BgImageGrass;

  return {
    canvasBgImage,
  };
}

export type InitializeEventListenersArgs = {
  canvas: HTMLCanvasElement;
  isPlayer1: boolean;
  user1: IUserData;
  userSpeedInput: number;
  usersData: {
    user1: GameSessionUser | UserData;
    user2?: GameSessionUser | UserData;
  };
  user2: IUserData;
  thickness: number;
  ballData: IBallData;
  slit: number;
};
export function initializeEventListeners({
  canvas,
  isPlayer1,
  user1,
  userSpeedInput,
  usersData,
  user2,
  thickness,
  ballData,
  slit,
}: InitializeEventListenersArgs): any[] {
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

    if (!isPlayer1 && !isSoloMode(usersData)) {
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
    if (!isPlayer1 && !isSoloMode(usersData)) {
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

  // function onTouchStart(event: TouchEvent) {
  //   const touch = event.touches[0];
  //   user1.y = touch.clientY - user1.height / 2;
  //   if (user1.y < thickness + ballData.radius * slit) {
  //     user1.y = thickness + ballData.radius * slit;
  //   } else if (
  //     user1.y >
  //     canvas.height - thickness - user1.height - ballData.radius * slit
  //   ) {
  //     user1.y =
  //       canvas.height - thickness - user1.height - ballData.radius * slit;
  //   }
  // }
  // canvas.addEventListener('touchstart', onTouchStart);

  const eventList = [
    { typeEvent: 'keydown', handler: onKeyDown },
    { typeEvent: 'mousemove', handler: onMouseMove },
    // { typeEvent: 'touchstart', handler: onTouchStart },
  ];

  return eventList;
}
