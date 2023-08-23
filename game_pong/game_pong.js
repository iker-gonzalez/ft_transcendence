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

const fps = 50;

(async () => {
  const canvas = document.getElementById("gamePong");

  function game(ballData, user1, bot, match_finish, match_points, sounds) {
    if (!match_finish) {
      setTimeout(() => {
        requestAnimationFrame(function () {
          game(ballData, user1, bot, match_finish, match_points, sounds);
        });
      }, 1000 / fps);

      match(ballData, user1, bot, sounds);

      render(ballData, user1, bot, match_finish, match_points);
    }
  }

  function match(ballData, user1, bot, sounds) {
    ballData.x += ballData.velocityX;
    ballData.y += ballData.velocityY;

    if (user1.y < thickness + ballData.radius * slit) {
      user1.y = thickness + ballData.radius * slit;
    } else if (
      user1.y >
      canvas.height - thickness - user1.height - ballData.radius * slit
    ) {
      user1.y =
        canvas.height - thickness - user1.height - ballData.radius * slit;
    }

    bot.y += (ballData.y - (bot.y + bot.height / 2)) * 0.1;
    if (bot.y < thickness + ballData.radius * slit) {
      bot.y = thickness + ballData.radius * slit;
    } else if (
      bot.y >
      canvas.height - thickness - bot.height - ballData.radius * slit
    ) {
      bot.y = canvas.height - thickness - bot.height - ballData.radius * slit;
    }

    if (
      ballData.y - ballData.radius - thickness < 0 ||
      ballData.y + ballData.radius + thickness > canvas.height
    ) {
      ballData.velocityY = -ballData.velocityY;
      sounds.wall.play().catch(function (error) {
        // console.log("Chrome cannot play sound without user interaction first");
      });
    }

    if (ballData.x + ballData.radius < 0 && !ballData.reset) {
      bot.score++;
      sounds.botScore.play().catch(function (error) {
        // console.log("Chrome cannot play sound without user interaction first");
      });
      let { newBallData, newUserData } = resetBall(ballData, user1);
      ballData = newBallData;
      user1 = newUserData;
    } else if (ballData.x - ballData.radius > canvas.width && !ballData.reset) {
      user1.score++;
      sounds.userScore.play().catch(function (error) {
        // console.log("Chrome cannot play sound without user interaction first");
      });
      let { newBallData, newUserData } = resetBall(ballData, user1);
      ballData = newBallData;
      user1 = newUserData;
    }

    let player = ballData.x + ballData.radius < canvas.width / 2 ? user1 : bot;

    if (checkCollision(ballData, player)) {
      sounds.hit.play().catch(function (error) {
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

  function resetBall(ballData, user1) {
    const newBallData = ballData;
    const newUserData = user1;
    newBallData.reset = true;

    setTimeout(() => {
      newBallData.x = canvas.width / 2;
      newBallData.y = canvas.height / 2;
      newBallData.velocityX = newBallData.velocityX;
      newBallData.velocityY = -newBallData.velocityY * Math.random(1);
      newBallData.speed = userSpeedInput;
      newUserData.height = 100;
      newBallData.reset = false;
    }, 1500);

    return { newBallData, newUserData };
  }

  function render(ballData, user1, bot, match_finish, match_points) {
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
      "Ball Speed: " + ballData.speed,
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

    drawArc(ballData.x, ballData.y, ballData.radius, ballData.color);
  }

  (async () => {
    // Logic
    let match_points = 500;
    let match_finish = false;

    const { hit, wall, userScore, botScore } = initializeSounds();
    const sounds = {
      hit,
      wall,
      userScore,
      botScore,
    };

    document.addEventListener("keydown", function (event) {
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
    });

    canvas.addEventListener("mousemove", function (event) {
      let rect = canvas.getBoundingClientRect();
      user1.y = event.clientY - rect.top - user1.height / 2;
      if (user1.y < thickness + ballData.radius * slit) {
        user1.y = thickness + ballData.radius * slit;
      } else if (user1.y > (canvas.height - thickness - user1.height - ballData.radius * slit)) {
        user1.y = canvas.height - thickness - user1.height - ballData.radius * slit;
      }
    });

    canvas.addEventListener("touchstart", function (event) {
      user1.y = event.clientY - user1.height / 2;
      if (user1.y < thickness + ballData.radius * slit) {
        user1.y = thickness + ballData.radius * slit;
      } else if (user1.y > (canvas.height - thickness - user1.height - ballData.radius * slit)) {
        user1.y = canvas.height - thickness - user1.height - ballData.radius * slit;
      }
    });

    let res = await initializeSessionInDb(ballData, user1, user2);

    const ball = res.data.ball;

    game(ball, user1, bot, match_finish, match_points, sounds);
  })();
})();