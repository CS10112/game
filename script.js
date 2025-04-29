const board = document.getElementById("gameBoard");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");
const scoreBreakdown = document.getElementById("scoreBreakdown");
const cellSize = 20;
let snake, enemySnake, direction, enemyDir, foodList, interval, score;
let isRunning = false;
let canMove = false;
let scoreStats = { 1: 0, 4: 0, 10: 0 };

let highScore = localStorage.getItem("highScore") || 0;
highScoreDisplay.textContent = `歷史最高分：${highScore}`;

const boardWidth = 800;
const boardHeight = 800;

function createCell(x, y, className) {
  const el = document.createElement("div");
  el.classList.add("cell", className);
  el.style.left = `${(x + 15) * cellSize}px`;
  el.style.top = `${(y + 15) * cellSize}px`;
  board.appendChild(el);
}

function draw() {
  board.innerHTML = "";
  foodList.forEach((food) => createCell(food.x, food.y, `food-${food.value}`));
  snake.forEach((part) => createCell(part.x, part.y, "snake"));
  enemySnake.forEach((part) => createCell(part.x, part.y, "enemy"));
  scoreDisplay.textContent = `分數：${score}`;
  scoreBreakdown.textContent = `1分食物：${scoreStats[1]}、4分食物：${scoreStats[4]}、10分食物：${scoreStats[10]}`;
  highScoreDisplay.textContent = `歷史最高分：${highScore}`;

  const head = snake[0];
  const offsetX = (head.x + 15) * cellSize - boardWidth / 2;
  const offsetY = (head.y + 15) * cellSize - boardHeight / 2;
  const maxX = Math.max(0, board.scrollWidth - boardWidth);
  const maxY = Math.max(0, board.scrollHeight - boardHeight);
  const scrollX = Math.min(Math.max(offsetX, 0), maxX);
  const scrollY = Math.min(Math.max(offsetY, 0), maxY);

  board.style.transform = `translate(-${scrollX}px, -${scrollY}px)`;
}

function moveSnake(snakeArr, dir) {
  const head = { x: snakeArr[0].x + dir.x, y: snakeArr[0].y + dir.y };
  snakeArr.unshift(head);
  return head;
}

function checkGameOver() {
  const head = snake[0];
  if (
    head.x < -15 ||
    head.x >= boardWidth / cellSize - 15 ||
    head.y < -15 ||
    head.y >= boardHeight / cellSize - 15
  ) {
    endGame();
  }
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      endGame();
      return;
    }
  }
}

function endGame() {
  clearInterval(interval);
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
  alert("遊戲結束！");
  startGame();
}

function update() {
  if (!canMove) return;

  const newHead = moveSnake(snake, direction);
  let ate = false;
  foodList = foodList.filter((food) => {
    if (food.x === newHead.x && food.y === newHead.y) {
      score += food.value;
      scoreStats[food.value]++;
      ate = true;
      return false;
    }
    return true;
  });

  if (!ate) snake.pop();
  if (foodList.length < 10) spawnFood();

  const enemyHead = moveSnake(enemySnake, enemyDir);
  enemySnake.pop();
  if (Math.random() < 0.2) enemyDir = randomDir();

  draw();
  checkGameOver();
}

function randomDir() {
  const dirs = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 }
  ];
  return dirs[Math.floor(Math.random() * dirs.length)];
}

function spawnFood() {
  while (foodList.length < 10) {
    const foodType = [1, 4, 10][Math.floor(Math.random() * 3)];
    foodList.push({
      x: Math.floor(Math.random() * 30) - 15,
      y: Math.floor(Math.random() * 30) - 15,
      value: foodType
    });
  }
}

function startGame() {
  clearInterval(interval);
  snake = [{ x: 0, y: 0 }];
  direction = { x: 1, y: 0 };
  enemySnake = [{ x: 5, y: 5 }];
  enemyDir = randomDir();
  foodList = [];
  score = 0;
  scoreStats = { 1: 0, 4: 0, 10: 0 };
  spawnFood();
  draw();
  isRunning = true;
  canMove = false;
  interval = setInterval(update, 100);
}

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      if (direction.y !== 1) direction = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (direction.y !== -1) direction = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (direction.x !== 1) direction = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (direction.x !== -1) direction = { x: 1, y: 0 };
      break;
    case " ":
      if (!isRunning) startGame();
      canMove = true;
      return;
  }
  if (!isRunning) startGame();
});

startGame();
