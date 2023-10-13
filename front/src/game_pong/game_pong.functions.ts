import {
  IBallData,
  INetData,
  INewSessionPayload,
  ISounds,
  IUserData,
  RenderColor,
} from './game_pong.interfaces';

export async function initializeSessionInDb(
  ball: IBallData,
  user1: IUserData,
  user2: IUserData,
): Promise<INewSessionPayload | void> {
  try {
    let response: Response = await fetch(
      'http://localhost:3000/game/sessions/new',
      {
        method: 'POST',
        body: JSON.stringify({
          ball: JSON.stringify(ball),
          player1: JSON.stringify(user1),
          player2: JSON.stringify(user2),
        }),
        headers: { 'Content-type': 'application/json; charset=UTF-8' },
      },
    );

    let json: Promise<INewSessionPayload> = response.json();

    return json;
  } catch (e) {
    console.log(e);
  }
}

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
  x: number,
  y: number,
  w: number,
  h: number,
  file: string,
): void {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  if (!ctx) return;

  const img = new Image();
  img.src = file;
  drawText(
    canvas,
    file,
    x + 30,
    y + 30,
    '12px Arial',
    'left',
    RenderColor.Green,
  );
  img.onload = function () {
    ctx.drawImage(img, x, y, w, h);
  };
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
  let hit = new Audio('./sounds/hit.wav');
  let wall = new Audio('./sounds/punch.wav');
  let userScore = new Audio('./sounds/strike.wav');
  let botScore = new Audio('./sounds/goal.wav');

  return { hit, wall, userScore, botScore };
}
