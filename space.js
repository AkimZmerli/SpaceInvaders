let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; // 32 * 16 = 512
let boardHeight = tileSize * rows; // 32 * 16 = 512
let context;

// score

let score = 0;
let gameOver = false;

// ship
let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = (tileSize * columns) / 2 - tileSize;
let shipY = tileSize * rows - tileSize * 2;

let ship = {
  x: shipX,
  y: shipY,
  width: shipWidth,
  height: shipHeight,
};

let shipImg;
let shipVelocityX = tileSize;

// aliens
let alienArray = [];
let alienWidth = tileSize * 1.25;
let alienHeight = tileSize * 1.15;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0;

let alienVelocityX = 1;

// Move these functions outside of update
function moveShip(e) {
  if (gameOver) {
    return;
  }
  if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
    ship.x -= shipVelocityX;
  } else if (
    e.code == "ArrowRight" &&
    ship.x + shipVelocityX + shipWidth <= boardWidth
  ) {
    ship.x += shipVelocityX;
  }
}

function createAliens() {
  for (let c = 0; c < alienColumns; c++) {
    // Fixed: changed alienRows to alienColumns
    for (let r = 0; r < alienRows; r++) {
      // This should use alienRows
      let alien = {
        img: alienImg,
        x: alienX + c * alienWidth,
        y: alienY + r * alienHeight,
        width: alienWidth,
        height: alienHeight,
        alive: true,
      };
      alienArray.push(alien);
    }
  }
  alienCount = alienArray.length;
}

// bullets

let bulletArray = [];
let bulletVelocityY = -10;

window.onload = () => {
  board = document.getElementById("board");
  board.width = boardWidth;
  board.height = boardHeight;
  context = board.getContext("2d"); // used for drawing on the board

  shipImg = new Image();
  shipImg.src = "./ship.png";

  shipImg.onload = () => {
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
  };

  alienImg = new Image();
  alienImg.src = "./alien.png";
  createAliens();

  requestAnimationFrame(update);
  document.addEventListener("keydown", moveShip);
  document.addEventListener("keyup", shoot);
};

function update() {
  requestAnimationFrame(update);

  if (gameOver) {
    return;
  }

  context.clearRect(0, 0, board.width, board.height);

  // ship
  context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

  // aliens
  for (let i = 0; i < alienArray.length; i++) {
    let alien = alienArray[i];
    if (alien.alive) {
      alien.x += alienVelocityX;

      if (alien.x + alien.width >= boardWidth || alien.x <= 0) {
        alienVelocityX *= -1;
        alien.x += alienVelocityX * 2;

        // move aliens up one row
        for (let j = 0; j < alienArray.length; j++) {
          let alien = alienArray[j];
          alien.y += tileSize;
        }
      }
      context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);
      if (alien.y >= ship.y) {
        gameOver = true;
      }
    }
  }
  // bullets
  for (let i = 0; i < bulletArray.length; i++) {
    let bullet = bulletArray[i];
    bullet.y += bulletVelocityY;
    context.fillStyle = "white";
    context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

    // bullet collision with aliens
    for (let j = 0; j < alienArray.length; j++) {
      let alien = alienArray[j];
      if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
        (bullet.used = true), (alien.alive = false), alienCount--;
        score += 100;
      }
    }
  }

  // clear bullets that have gone off the screen
  while (
    (bulletArray.length > 0 && bulletArray[0].used) ||
    bulletArray[0].y < 0
  ) {
    bulletArray.shift();
  }

  // next level
  if (alienCount == 0) {
    // increases the number of aliens
    alienColumns = Math.min(alienColumns + 1, columns / 2 - 2); // cap at 16/2 -2 = 6
    alienRows = Math.min(alienRows + 1, rows - 4); // cap at 16-4 = 12
    alienVelocityX += 0.2;
    alienArray = [];
    bulletArray = [];
    createAliens();
  }
  // score
  context.fillStyle = "white";
  context.font = "16px courier";
  context.fillText(score, 5, 20);
  if (gameOver) {
    context.fillStyle = "red";
    context.fillText("Game Over", boardWidth / 2, boardHeight / 2);
  }
}
function shoot(e) {
  if (gameOver) {
    return;
  }
  if (e.code == "Space") {
    let bullet = {
      x: ship.x + (shipWidth * 15) / 32,
      y: ship.y,
      width: tileSize / 8,
      height: tileSize / 2,
      used: false,
    };
    bulletArray.push(bullet);
  }
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width && // a's top left corner doesn't reach b's top right corner
    a.x + a.width > b.x && // a's top right corner passes b's
    a.y < b.y + b.height && // a's top left corner doesn't reach b's bottom left corner
    a.y + a.height > b.y
  ); // a's bottom left corner passes b's top left corner
}
