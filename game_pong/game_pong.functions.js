import { net } from "./game_pong.constants.js";

const canvas = document.getElementById("gamePong");
const ctx = canvas.getContext("2d");

export async function initializeSessionInDb(ball) {
  try {
    let response = await fetch("http://localhost:3000/game/sessions/new", {
      method: "POST",
      body: JSON.stringify({ ball: JSON.stringify(ball) }),
      headers: { "Content-type": "application/json; charset=UTF-8" },
    });

    let json = response.json();

    return json;
  } catch (e) {
    console.log(e);
  }
}

export function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

export function drawArc(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
}

export function drawDashedLine() {
  for (let i = 0; i <= canvas.height; i += 20) {
    drawRect(net.x, net.y + i, net.width, net.height, net.color);
  }
}

export function drawText(text, x, y, font, align, color) {
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.font = font;
  ctx.fillText(text, x, y);
}

export function checkCollision(b, p) {
  p.top = p.y;
  p.bottom = p.y + p.height;
  p.left = p.x;
  p.right = p.x + p.width;

  b.top = b.y - b.radius;
  b.bottom = b.y + b.radius;
  b.left = b.x - b.radius;
  b.right = b.x + b.radius;

  return (
    p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top
  );
}

export function initializeSounds() {
  let hit = new Audio("sounds/hit.wav");
  let wall = new Audio("sounds/punch.wav");
  let userScore = new Audio("sounds/strike.wav");
  let botScore = new Audio("sounds/goal.wav");

  return { hit, wall, userScore, botScore };
}
