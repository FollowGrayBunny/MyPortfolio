// Elementi principali del gioco
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');

canvas.width = 800;
canvas.height = 600;

// Game settings
const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 36,
  speed: 4,
  lastDirection: { dx: 0, dy: -1 }, // Default to shooting upwards
};

let bullets = [];
let zombies = [];
let score = 0;
let gameInterval;
let animationFrame;

const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
};

// Player movement
function updatePlayer() {
  if (keys.w && player.y > 0) {
    player.y -= player.speed;
    player.lastDirection = { dx: 0, dy: -1 };
  }
  if (keys.s && player.y < canvas.height - player.size) {
    player.y += player.speed;
    player.lastDirection = { dx: 0, dy: 1 };
  }
  if (keys.a && player.x > 0) {
    player.x -= player.speed;
    player.lastDirection = { dx: -1, dy: 0 };
  }
  if (keys.d && player.x < canvas.width - player.size) {
    player.x += player.speed;
    player.lastDirection = { dx: 1, dy: 0 };
  }
}

// Bullets logic
function updateBullets() {
  bullets = bullets.filter(b => b.x >= 0 && b.x <= canvas.width && b.y >= 0 && b.y <= canvas.height);
  bullets.forEach(b => {
    b.x += b.dx;
    b.y += b.dy;
  });
}

// Zombies logic
function spawnZombie() {
  const size = 30;
  const x = Math.random() < 0.5 ? 0 : canvas.width - size;
  const y = Math.random() * canvas.height;
  const speed = 1.5; // Velocità iniziale degli zombie
  zombies.push({ x, y, size, speed, color: 'green' });
}

function updateZombies() {
  zombies.forEach(z => {
    const angle = Math.atan2(player.y - z.y, player.x - z.x);
    z.x += Math.cos(angle) * z.speed;
    z.y += Math.sin(angle) * z.speed;
  });
}

// Collision detection
function checkCollisions() {
  bullets.forEach((b, bIdx) => {
    zombies.forEach((z, zIdx) => {
      const dist = Math.hypot(b.x - z.x, b.y - z.y);
      if (dist < z.size / 2) {
        bullets.splice(bIdx, 1);
        zombies.splice(zIdx, 1);
        score++;
      }
    });
  });

  zombies.forEach(z => {
    const dist = Math.hypot(player.x - z.x, player.y - z.y);
    if (dist < z.size / 2 + player.size / 2) {
      alert('Game Over! Your Score: ' + score);
      stopGame();
    }
  });
}

function resetGame() {
  zombies = [];
  bullets = [];
  score = 0;
  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  player.speed = 4; // Resetta la velocità del giocatore
  player.lastDirection = { dx: 0, dy: -1 };
  keys.w = false;
  keys.a = false;
  keys.s = false;
  keys.d = false;
}

// Draw functions
function drawPlayer() {
  const playerImage = new Image();
  if (player.lastDirection.dx === 0 && player.lastDirection.dy === -1) {
    playerImage.src = '../../assets/game/player/Bih_Up.png';
  } else if (player.lastDirection.dx === 0 && player.lastDirection.dy === 1) {
    playerImage.src = '../../assets/game/player/Bih_Dw.png';
  } else if (player.lastDirection.dx === -1 && player.lastDirection.dy === 0) {
    playerImage.src = '../../assets/game/player/Bih_Sx.png';
  } else if (player.lastDirection.dx === 1 && player.lastDirection.dy === 0) {
    playerImage.src = '../../assets/game/player/Bih_Rx.png';
  }
  ctx.drawImage(
    playerImage,
    player.x - player.size / 2,
    player.y - player.size / 2,
    player.size,
    player.size
  );
}

function drawBullets() {
  ctx.fillStyle = 'yellow';
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawZombies() {
  const zombieLeftImage = new Image();
  zombieLeftImage.src = '../../assets/game/Zombie_Sx.png'; // Sostituisci con il percorso dell'immagine degli zombie da sinistra
  const zombieRightImage = new Image();
  zombieRightImage.src = '../../assets/game/Zombie_Dx.png'; // Sostituisci con il percorso dell'immagine degli zombie da destra

  zombies.forEach(z => {
    const isFromLeft = z.x < canvas.width / 2;
    const zombieImage = isFromLeft ? zombieLeftImage : zombieRightImage;
    ctx.drawImage(
      zombieImage,
      z.x - z.size / 2,
      z.y - z.size / 2,
      z.size,
      z.size
    );
  });
}

function drawScore() {
  const backgroundWidth = 150; // Larghezza del rettangolo
  const backgroundHeight = 40; // Altezza del rettangolo
  const x = 10; // Posizione X
  const y = 10; // Posizione Y

  // Disegna lo sfondo
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Sfondo semi-trasparente
  ctx.fillRect(x, y, backgroundWidth, backgroundHeight);

  // Disegna il punteggio
  ctx.fillStyle = 'yellow'; // Colore del testo
  ctx.font = '30px Arial'; // Font e dimensione del testo
  ctx.fillText('Score: ' + score, x + 10, y + 30); // Testo posizionato con margini

}

// Main game loop
let floorImage = new Image();
floorImage.src = '../../assets/game/Floor.jpg'; // Sostituisci con il percorso della texture

function drawFloor() {
  for (let y = 0; y < canvas.height; y += floorImage.height) {
    for (let x = 0; x < canvas.width; x += floorImage.width) {
      ctx.drawImage(floorImage, x, y, floorImage.width, floorImage.height);
    }
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawFloor();

  updatePlayer();
  updateBullets();
  updateZombies();
  checkCollisions();

  drawPlayer();
  drawBullets();
  drawZombies();
  drawScore();

  animationFrame = requestAnimationFrame(gameLoop);
}

// Controls
window.addEventListener('keydown', e => {
  if (e.key === 'w') keys.w = true;
  if (e.key === 'a') keys.a = true;
  if (e.key === 's') keys.s = true;
  if (e.key === 'd') keys.d = true;
  if (e.key === ' ') {
    bullets.push({
      x: player.x,
      y: player.y,
      dx: player.lastDirection.dx * 6,
      dy: player.lastDirection.dy * 6,
    });
  }
});

window.addEventListener('keyup', e => {
  if (e.key === 'w') keys.w = false;
  if (e.key === 'a') keys.a = false;
  if (e.key === 's') keys.s = false;
  if (e.key === 'd') keys.d = false;
});

// Start and Stop Game
function startGame() {
  startButton.style.display = 'none';
  stopButton.style.display = 'block';
  canvas.style.display = 'block';
  gameInterval = setInterval(spawnZombie, 2000);
  gameLoop();
}

function stopGame() {
  stopButton.style.display = 'none';
  startButton.style.display = 'block';
  clearInterval(gameInterval);
  cancelAnimationFrame(animationFrame);
  resetGame();
}

startButton.addEventListener('click', startGame);
stopButton.addEventListener('click', stopGame);
