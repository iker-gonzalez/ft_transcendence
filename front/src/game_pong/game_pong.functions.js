export async function initializeSessionInDb(ball, user1, user2) {
  try {
    let response = await fetch('http://localhost:3000/game/sessions/new', {
      method: 'POST',
      body: JSON.stringify({
        ball: JSON.stringify(ball),
        player1: JSON.stringify(user1),
        player2: JSON.stringify(user2),
      }),
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    });

    let json = response.json();

    return json;
  } catch (e) {
    console.log(e);
  }
}

export function drawRect(canvas, x, y, w, h, color) {
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

export function drawArc(canvas, x, y, r, color) {
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
}

export function drawDashedLine(canvas, net) {
  for (let i = 0; i <= canvas.height; i += 20) {
    drawRect(canvas, net.x, net.y + i, net.width, net.height, net.color);
  }
}

export function drawText(canvas, text, x, y, font, align, color) {
  const ctx = canvas.getContext('2d');

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
  let hit = new Audio('sounds/hit.wav');
  let wall = new Audio('sounds/punch.wav');
  let userScore = new Audio('sounds/strike.wav');
  let botScore = new Audio('sounds/goal.wav');

  return { hit, wall, userScore, botScore };
}
