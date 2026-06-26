const canvas = document.querySelector("#board");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const bestScoreEl = document.querySelector("#bestScore");
const messageEl = document.querySelector("#message");
const startButton = document.querySelector("#startButton");
const pauseButton = document.querySelector("#pauseButton");
const restartButton = document.querySelector("#restartButton");

const cells = 21;
const cellSize = canvas.width / cells;
const tickMs = 110;
const directions = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const candyColors = ["#ff4f51", "#ffd84f", "#38b9ff", "#ff7fb1", "#79df58", "#b078ff"];

let snake;
let apple;
let direction;
let nextDirection;
let score;
let bestScore = Number(localStorage.getItem("snake-best-score") || 0);
let timer = null;
let isRunning = false;
let isGameOver = false;

bestScoreEl.textContent = bestScore;
resetGame();
draw();

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = directions.right;
  nextDirection = directions.right;
  score = 0;
  apple = placeApple();
  isGameOver = false;
  scoreEl.textContent = score;
  setMessage("按空格开始", "方向键或 WASD 控制移动");
}

function startGame() {
  if (isGameOver) {
    resetGame();
  }

  if (isRunning) {
    return;
  }

  isRunning = true;
  messageEl.classList.add("is-hidden");
  timer = window.setInterval(tick, tickMs);
}

function pauseGame() {
  if (!isRunning) {
    return;
  }

  isRunning = false;
  window.clearInterval(timer);
  setMessage("已暂停", "按空格或开始继续");
}

function restartGame() {
  window.clearInterval(timer);
  timer = null;
  isRunning = false;
  resetGame();
  draw();
}

function tick() {
  direction = nextDirection;
  const head = snake[0];
  const nextHead = {
    x: head.x + direction.x,
    y: head.y + direction.y,
  };

  if (hitsWall(nextHead) || hitsSnake(nextHead)) {
    endGame();
    return;
  }

  snake.unshift(nextHead);

  if (nextHead.x === apple.x && nextHead.y === apple.y) {
    score += 10;
    scoreEl.textContent = score;
    apple = placeApple();
  } else {
    snake.pop();
  }

  draw();
}

function endGame() {
  window.clearInterval(timer);
  timer = null;
  isRunning = false;
  isGameOver = true;

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("snake-best-score", String(bestScore));
    bestScoreEl.textContent = bestScore;
  }

  setMessage("游戏结束", "按空格或重开再来一局");
  draw();
}

function setDirection(name) {
  const wanted = directions[name];
  if (!wanted || isOpposite(wanted, direction)) {
    return;
  }

  nextDirection = wanted;
  if (!isRunning && !isGameOver) {
    startGame();
  }
}

function isOpposite(a, b) {
  return a.x + b.x === 0 && a.y + b.y === 0;
}

function hitsWall(position) {
  return (
    position.x < 0 ||
    position.x >= cells ||
    position.y < 0 ||
    position.y >= cells
  );
}

function hitsSnake(position) {
  return snake.some((part) => part.x === position.x && part.y === position.y);
}

function placeApple() {
  let candidate;
  do {
    candidate = {
      x: Math.floor(Math.random() * cells),
      y: Math.floor(Math.random() * cells),
    };
  } while (snake.some((part) => part.x === candidate.x && part.y === candidate.y));

  return candidate;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBoard();
  drawCandyDots();
  drawApple();
  drawSnake();
}

function drawBoard() {
  const fieldGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  fieldGradient.addColorStop(0, "#eaff9b");
  fieldGradient.addColorStop(0.42, "#c9f77d");
  fieldGradient.addColorStop(1, "#7ed957");
  ctx.fillStyle = fieldGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < cells; y += 1) {
    for (let x = 0; x < cells; x += 1) {
      const isLight = (x + y) % 2 === 0;
      ctx.fillStyle = isLight ? "rgba(255,255,255,0.18)" : "rgba(79,151,54,0.08)";
      roundRect(x * cellSize + 2, y * cellSize + 2, cellSize - 4, cellSize - 4, 6);
      ctx.fill();
    }
  }

  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 1;
  for (let index = 1; index < cells; index += 1) {
    const line = index * cellSize;
    ctx.beginPath();
    ctx.moveTo(line, 0);
    ctx.lineTo(line, canvas.height);
    ctx.moveTo(0, line);
    ctx.lineTo(canvas.width, line);
    ctx.stroke();
  }
}

function drawCandyDots() {
  const dots = [
    { x: 2.6, y: 3.4, color: "#ff7fb1" },
    { x: 5.2, y: 15.6, color: "#5ed6ff" },
    { x: 15.5, y: 4.8, color: "#ffd84f" },
    { x: 18.4, y: 14.4, color: "#b078ff" },
    { x: 3.4, y: 19.1, color: "#ff8a3c" },
    { x: 17.1, y: 18.1, color: "#ff4f51" },
  ];

  dots.forEach((dot) => {
    const x = dot.x * cellSize;
    const y = dot.y * cellSize;
    ctx.save();
    ctx.globalAlpha = 0.68;
    ctx.fillStyle = dot.color;
    ctx.beginPath();
    ctx.ellipse(x, y, cellSize * 0.28, cellSize * 0.2, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.78)";
    ctx.beginPath();
    ctx.ellipse(x - 3, y - 4, cellSize * 0.09, cellSize * 0.045, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawSnake() {
  snake.forEach((part, index) => {
    drawSnakePart(part, index);
  });
  drawSnakeFace(snake[0]);
}

function drawSnakePart(part, index) {
  const x = part.x * cellSize;
  const y = part.y * cellSize;
  const inset = index === 0 ? 1.5 : 2.5;
  const size = cellSize - inset * 2;
  const color = index === 0 ? "#ff4f51" : candyColors[index % candyColors.length];

  ctx.save();
  ctx.shadowColor = "rgba(61, 39, 80, 0.22)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = color;
  roundRect(x + inset, y + inset, size, size, 9);
  ctx.fill();
  ctx.shadowColor = "transparent";

  const shine = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
  shine.addColorStop(0, "rgba(255,255,255,0.82)");
  shine.addColorStop(0.38, "rgba(255,255,255,0.18)");
  shine.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = shine;
  roundRect(x + inset + 3, y + inset + 3, size * 0.58, size * 0.38, 7);
  ctx.fill();

  ctx.strokeStyle = "rgba(94, 46, 114, 0.18)";
  ctx.lineWidth = 1;
  for (let scale = 0; scale < 3; scale += 1) {
    ctx.beginPath();
    ctx.arc(x + cellSize / 2, y + cellSize / 2, 4 + scale * 4, 0.15, Math.PI - 0.15);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSnakeFace(head) {
  const cx = head.x * cellSize + cellSize / 2;
  const cy = head.y * cellSize + cellSize / 2;
  const eyeOffsetX = direction.y === 0 ? 4 : 6;
  const eyeOffsetY = direction.x === 0 ? 4 : 6;
  const faceShiftX = direction.x * 4;
  const faceShiftY = direction.y * 4;

  drawEye(cx - eyeOffsetX + faceShiftX, cy - eyeOffsetY + faceShiftY);
  drawEye(cx + eyeOffsetX + faceShiftX, cy + eyeOffsetY + faceShiftY);

  ctx.strokeStyle = "#7a1429";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx + direction.x * 7, cy + direction.y * 7);
  ctx.lineTo(cx + direction.x * 14, cy + direction.y * 14);
  ctx.stroke();
}

function drawEye(x, y) {
  ctx.fillStyle = "#fff8f0";
  ctx.beginPath();
  ctx.arc(x, y, 4.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3b2448";
  ctx.beginPath();
  ctx.arc(x + 1, y + 1, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x - 1, y - 1, 1.1, 0, Math.PI * 2);
  ctx.fill();
}

function drawApple() {
  const centerX = apple.x * cellSize + cellSize / 2;
  const centerY = apple.y * cellSize + cellSize / 2;

  const appleGradient = ctx.createRadialGradient(
    centerX - 5,
    centerY - 7,
    2,
    centerX,
    centerY,
    cellSize * 0.42,
  );
  appleGradient.addColorStop(0, "#fff9d6");
  appleGradient.addColorStop(0.28, "#ff7b7b");
  appleGradient.addColorStop(1, "#d91f35");

  ctx.save();
  ctx.shadowColor = "rgba(91, 40, 60, 0.28)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = appleGradient;
  ctx.beginPath();
  ctx.arc(centerX - 4, centerY + 1, cellSize * 0.27, 0, Math.PI * 2);
  ctx.arc(centerX + 4, centerY + 1, cellSize * 0.27, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = "transparent";

  ctx.fillStyle = "#5a3c1f";
  roundRect(centerX + 1, centerY - cellSize * 0.48, 5, 10, 3);
  ctx.fill();
  ctx.fillStyle = "#67c856";
  ctx.beginPath();
  ctx.ellipse(centerX + 9, centerY - cellSize * 0.42, 8, 4, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function roundRect(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function setMessage(title, text) {
  messageEl.classList.remove("is-hidden");
  messageEl.innerHTML = `<strong>${title}</strong><span>${text}</span>`;
}

const keyMap = {
  ArrowUp: "up",
  KeyW: "up",
  ArrowDown: "down",
  KeyS: "down",
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
};

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    if (isRunning) {
      pauseGame();
    } else {
      startGame();
    }
    return;
  }

  const mappedDirection = keyMap[event.code];
  if (mappedDirection) {
    event.preventDefault();
    setDirection(mappedDirection);
  }
});

document.querySelectorAll("[data-direction]").forEach((button) => {
  button.addEventListener("click", () => {
    setDirection(button.dataset.direction);
  });
});

startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", pauseGame);
restartButton.addEventListener("click", restartGame);
