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
  drawApple();
  drawSnake();
}

function drawBoard() {
  ctx.fillStyle = "#d6ead8";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(23, 33, 27, 0.14)";
  ctx.lineWidth = 1;

  for (let index = 1; index < cells; index += 1) {
    const line = index * cellSize;
    ctx.beginPath();
    ctx.moveTo(line, 0);
    ctx.lineTo(line, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, line);
    ctx.lineTo(canvas.width, line);
    ctx.stroke();
  }
}

function drawSnake() {
  snake.forEach((part, index) => {
    const inset = index === 0 ? 3 : 4;
    ctx.fillStyle = index === 0 ? "#274c2f" : "#5f8f4e";
    ctx.fillRect(
      part.x * cellSize + inset,
      part.y * cellSize + inset,
      cellSize - inset * 2,
      cellSize - inset * 2,
    );
  });
}

function drawApple() {
  const centerX = apple.x * cellSize + cellSize / 2;
  const centerY = apple.y * cellSize + cellSize / 2;
  ctx.fillStyle = "#d63f35";
  ctx.beginPath();
  ctx.arc(centerX, centerY, cellSize * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#274c2f";
  ctx.fillRect(centerX + 2, centerY - cellSize * 0.42, 5, 8);
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
