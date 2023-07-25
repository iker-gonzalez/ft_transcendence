const canvas = document.getElementById("gamePong");

export const thickness = 10;
export const slit = 3;
export const userSpeedInput = 10;

export const ballData = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  velocityX: 5,
  velocityY: 5,
  speed: userSpeedInput,
  color: "WHITE",
  reset: false,
};

export const user1 = {
  x: 30,
  y: canvas.height / 2 - 100 / 2,
  width: 10,
  height: 100,
  score: 0,
  color: "WHITE",
};

export const user2 = {
  x: canvas.width - 40,
  y: canvas.height / 2 - 100 / 2,
  width: 10,
  height: 100,
  score: 0,
  color: "WHITE",
};

export const bot = {
  x: canvas.width - 40,
  y: canvas.height / 2 - 100 / 2,
  width: 10,
  height: 100,
  score: 0,
  color: "WHITE",
};

export const net = {
  x: canvas.width / 2 - 5,
  y: 0,
  height: 10,
  width: 10,
  color: "WHITE",
};
