import {
  ballData,
  bot,
  slit,
  thickness,
  user1,
  user2,
  userSpeedInput,
} from "./game_pong.constants.js";
import {
  checkCollision,
  drawArc,
  drawDashedLine,
  drawRect,
  drawText,
  initializeSessionInDb,
  initializeSounds,
} from "./game_pong.functions.js";

const canvas = document.getElementById("gamePong");

function game() {
  if (!match_finish) {
    requestAnimationFrame(game);
    match();
    render();
  }
}

function match() {
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  if (user1.y < thickness + ball.radius * slit) {
    user1.y = thickness + ball.radius * slit;
  } else if (
    user1.y >
    canvas.height - thickness - user1.height - ball.radius * slit
  ) {
    user1.y = canvas.height - thickness - user1.height - ball.radius * slit;
  }

  bot.y += (ball.y - (bot.y + bot.height / 2)) * 0.1;
  if (bot.y < thickness + ball.radius * slit) {
    bot.y = thickness + ball.radius * slit;
  } else if (
    bot.y >
    canvas.height - thickness - bot.height - ball.radius * slit
  ) {
    bot.y = canvas.height - thickness - bot.height - ball.radius * slit;
  }

  if (
    ball.y - ball.radius - thickness < 0 ||
    ball.y + ball.radius + thickness > canvas.height
  ) {
    ball.velocityY = -ball.velocityY;
    wall.play();
  }

  if (ball.x + ball.radius < 0 && !ball.reset) {
    bot.score++;
    botScore.play();
    resetBall();
  } else if (ball.x - ball.radius > canvas.width && !ball.reset) {
    user1.score++;
    userScore.play();
    resetBall();
  }

  let player = ball.x + ball.radius < canvas.width / 2 ? user1 : bot;

  if (checkCollision(ball, player)) {
    hit.play();
    let collidePoint = ball.y - (player.y + player.height / 2);
    collidePoint = collidePoint / (player.height / 2);

    let angleRad = (Math.PI / 4) * collidePoint;

    let direction = ball.x + ball.radius < canvas.width / 2 ? 1 : -1;
    ball.velocityX = direction * ball.speed * Math.cos(angleRad);
    ball.velocityY = ball.speed * Math.sin(angleRad);

    ball.speed += 0.1;
    user1.height -= 2;
  }
}

function onKeyDown(event) {
  if (event.keyCode === 38) {
    // UP ARROW key
    user1.y -= userSpeedInput * 5;
  } else if (event.keyCode === 40) {
    // DOWN ARROW key
    user1.y += userSpeedInput * 5;
  }

  if (event.keyCode === 27) {
    // ESCAPE key
    alert("🚦 PAUSE");
  }
}

function getMousePos(event) {
  let rect = canvas.getBoundingClientRect();
  user1.y = event.clientY - rect.top - user1.height / 2;
  if (user1.y < thickness + ball.radius * slit) {
    user1.y = thickness + ball.radius * slit;
  } else if (
    user1.y >
    canvas.height - thickness - user1.height - ball.radius * slit
  ) {
    user1.y = canvas.height - thickness - user1.height - ball.radius * slit;
  }
}

function getTouchPos(event) {
  user1.y = event.clientY - user1.height / 2;
  if (user1.y < thickness + ball.radius * slit) {
    user1.y = thickness + ball.radius * slit;
  } else if (
    user1.y >
    canvas.height - thickness - user1.height - ball.radius * slit
  ) {
    user1.y = canvas.height - thickness - user1.height - ball.radius * slit;
  }
}

function resetBall() {
  ball.reset = true;
  setTimeout(() => {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = ball.velocityX;
    ball.velocityY = -ball.velocityY * Math.random(1);
    ball.speed = userSpeedInput;
    user1.height = 100;
    ball.reset = false;
  }, 1500);
}

function render() {
  drawRect(0, 0, canvas.width, canvas.height, "Black");

  drawText(
    "USER_1",
    (canvas.width / 10) * 4,
    canvas.height / 10,
    "10px Arial",
    "right",
    "yellow"
  );
  drawText(
    user1.score,
    (canvas.width / 10) * 4,
    canvas.height / 6,
    "40px Arial",
    "right",
    "red"
  );
  if (user1.score >= match_points) {
    match_finish = true;
    drawText(
      "🏆 WINNER",
      (canvas.width / 10) * 4,
      canvas.height / 4.5,
      "30px Arial",
      "right",
      "green"
    );
    setTimeout(() => {
      alert("⭐️ USER 1 WINS ⭐️");
    }, 10);
  }

  drawText(
    "COMPUTER_BOT",
    (canvas.width / 10) * 6,
    canvas.height / 10,
    "10px Arial",
    "left",
    "yellow"
  );
  drawText(
    bot.score,
    (canvas.width / 10) * 6,
    canvas.height / 6,
    "40px Arial",
    "left",
    "red"
  );
  if (bot.score >= match_points) {
    match_finish = true;
    drawText(
      "🏆 WINNER",
      (canvas.width / 10) * 6,
      canvas.height / 4.5,
      "30px Arial",
      "left",
      "green"
    );
    setTimeout(() => {
      alert("⭐️ COMPUTER BOT WINS ⭐️");
    }, 10);
  }

  drawText(
    "Ball Speed: " + ball.speed,
    (canvas.width / 10) * 7,
    (canvas.height / 20) * 17,
    "15px Arial",
    "left",
    "grey"
  );
  drawText(
    "Paddle Height: " + user1.height,
    (canvas.width / 10) * 7,
    (canvas.height / 20) * 18,
    "15px Arial",
    "left",
    "grey"
  );

  drawRect(0, 0, canvas.width, thickness, "White");
  drawRect(0, canvas.height - thickness, canvas.width, thickness, "White");
  drawDashedLine();

  drawRect(user1.x, user1.y, user1.width, user1.height, user1.color);

  drawRect(bot.x, bot.y, bot.width, bot.height, bot.color);

  drawArc(ball.x, ball.y, ball.radius, ball.color);
}

// Logic
let match_points = 500;
let match_finish = false;
let ball;

const { hit, wall, userScore, botScore } = initializeSounds();

document.addEventListener("keydown", onKeyDown);
canvas.addEventListener("mousemove", getMousePos);
canvas.addEventListener("touchmove", getTouchPos);

(async () => {
  let res = await initializeSessionInDb(ballData);

  ball = res.data.ball;

  console.log("Ball data:", ball);
})();

// Allow time to create session on DB
setTimeout(() => {
  console.log("Game starts");
  game();
}, 750);
