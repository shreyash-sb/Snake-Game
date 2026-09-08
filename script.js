/**
 * SWEET & SIMPLE SNAKE GAME
 * Scaled Canvas, Dark/Light Themes, and Crisp Gameplay.
 */

(function () {
  'use strict';

  // Constants
  const GRID_SIZE = 20; // 20x20 grid
  const TICK_SPEED = 105; // ms per tick

  // =========================================================================
  // AUDIO SYNTHESIZER (Gentle Web Audio Chimes)
  // =========================================================================

  class Sound {
    constructor() {
      this.ctx = null;
      this.muted = localStorage.getItem('snake_muted') === 'true';
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playEat() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(960, now + 0.08);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
      } catch (e) {}
    }

    playGameOver() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.35);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
      } catch (e) {}
    }

    playClick() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.03);
      } catch (e) {}
    }
  }

  const audio = new Sound();

  // =========================================================================
  // DOM ELEMENTS
  // =========================================================================

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const highScoreEl = document.getElementById('highScore');

  const themeBtn = document.getElementById('themeBtn');
  const themeIcon = document.getElementById('themeIcon');
  const soundBtn = document.getElementById('soundBtn');
  const soundIcon = document.getElementById('soundIcon');
  const restartBtn = document.getElementById('restartBtn');

  const overlay = document.getElementById('overlay');
  const startBox = document.getElementById('startBox');
  const pauseBox = document.getElementById('pauseBox');
  const gameOverBox = document.getElementById('gameOverBox');

  const startBtn = document.getElementById('startBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const playAgainBtn = document.getElementById('playAgainBtn');

  const finalScore = document.getElementById('finalScore');
  const finalBest = document.getElementById('finalBest');
  const trophyBanner = document.getElementById('trophyBanner');

  // =========================================================================
  // STATE VARIABLES
  // =========================================================================

  let currentTheme = localStorage.getItem('snake_theme') || 'dark';
  let snake = [];
  let food = { x: 14, y: 10 };
  let direction = 'right';
  let inputQueue = [];
  let score = 0;
  let highScore = parseInt(localStorage.getItem('snake_highscore') || '0', 10);
  let isRunning = false;
  let isPaused = false;
  let gameInterval = null;

  // =========================================================================
  // INITIALIZATION
  // =========================================================================

  function init() {
    applyTheme(currentTheme);
    highScoreEl.textContent = highScore;
    updateSoundUI();
    resizeCanvas();
    drawScene();

    setupEvents();
  }

  // Theme Handling
  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('snake_theme', theme);
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    themeBtn.setAttribute('title', theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme');
    drawScene();
  }

  function toggleTheme() {
    audio.playClick();
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  }

  // Canvas Sizing
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const size = Math.floor(rect.width || 500);

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
    drawScene();
  });

  // =========================================================================
  // GAMEPLAY LOGIC
  // =========================================================================

  function startGame() {
    audio.init();

    // Center snake
    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];

    direction = 'right';
    inputQueue = [];
    score = 0;
    scoreEl.textContent = '0';
    isRunning = true;
    isPaused = false;

    spawnFood();
    hideOverlays();

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, TICK_SPEED);
  }

  function pauseGame() {
    if (!isRunning) return;

    if (isPaused) {
      isPaused = false;
      hideOverlays();
      gameInterval = setInterval(gameLoop, TICK_SPEED);
      audio.playClick();
    } else {
      isPaused = true;
      clearInterval(gameInterval);
      showOverlay('pause');
      audio.playClick();
    }
  }

  function gameOver() {
    isRunning = false;
    isPaused = false;
    clearInterval(gameInterval);
    audio.playGameOver();

    // High Score Handling
    const isNewBest = score > highScore;
    if (isNewBest) {
      highScore = score;
      localStorage.setItem('snake_highscore', highScore.toString());
      highScoreEl.textContent = highScore;
      trophyBanner.classList.remove('hidden');
    } else {
      trophyBanner.classList.add('hidden');
    }

    finalScore.textContent = score;
    finalBest.textContent = highScore;

    showOverlay('gameover');
  }

  // Food Spawning
  function spawnFood() {
    let valid = false;
    while (!valid) {
      const pos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };

      const onSnake = snake.some(seg => seg.x === pos.x && seg.y === pos.y);
      if (!onSnake) {
        food = pos;
        valid = true;
      }
    }
  }

  // Main Game Loop
  function gameLoop() {
    if (inputQueue.length > 0) {
      direction = inputQueue.shift();
    }

    const head = { x: snake[0].x, y: snake[0].y };

    if (direction === 'up') head.y--;
    if (direction === 'down') head.y++;
    if (direction === 'left') head.x--;
    if (direction === 'right') head.x++;

    // Wall Collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      gameOver();
      return;
    }

    // Self Collision
    if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      gameOver();
      return;
    }

    // Move Snake
    snake.unshift(head);

    // Food Collision
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      scoreEl.textContent = score;
      audio.playEat();
      spawnFood();
    } else {
      snake.pop();
    }

    drawScene();
  }

  // =========================================================================
  // DRAWING ROUTINES
  // =========================================================================

  function drawScene() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const tileSize = w / GRID_SIZE;

    ctx.clearRect(0, 0, w, h);

    // Subtle Grid Lines
    ctx.strokeStyle = currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.035)' : 'rgba(0, 0, 0, 0.035)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      const pos = i * tileSize;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, h);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(w, pos);
      ctx.stroke();
    }

    // Draw Sweet Apple Food
    drawApple(food, tileSize);

    // Draw Snake
    if (snake.length > 0) {
      drawSnake(tileSize);
    }
  }

  function drawApple(pos, size) {
    const cx = pos.x * size + size / 2;
    const cy = pos.y * size + size / 2;
    const radius = size * 0.4;

    // Apple Red Body
    ctx.fillStyle = '#f85149';
    ctx.beginPath();
    ctx.arc(cx, cy + 1, radius, 0, Math.PI * 2);
    ctx.fill();

    // Apple Little Stem & Green Leaf
    ctx.fillStyle = '#8b5a2b'; // stem
    ctx.fillRect(cx - 0.75, cy - radius - 2, 1.5, 3.5);

    ctx.fillStyle = '#3fb950'; // leaf
    ctx.beginPath();
    ctx.arc(cx + 2.5, cy - radius - 0.5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Soft shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(cx - radius * 0.35, cy - radius * 0.3, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawSnake(size) {
    const headColor = currentTheme === 'dark' ? '#3fb950' : '#22c55e';
    const bodyColor = currentTheme === 'dark' ? '#2ea043' : '#16a34a';

    snake.forEach((seg, idx) => {
      const sx = seg.x * size;
      const sy = seg.y * size;
      const pad = 1.5;
      const rad = idx === 0 ? 6 : 4.5;

      ctx.fillStyle = idx === 0 ? headColor : bodyColor;

      ctx.beginPath();
      roundRect(ctx, sx + pad, sy + pad, size - pad * 2, size - pad * 2, rad);
      ctx.fill();

      // Cute Eyes on Snake Head
      if (idx === 0) {
        drawEyes(sx, sy, size, direction);
      }
    });
  }

  function drawEyes(x, y, size, dir) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const offset = size * 0.22;
    const eyeRadius = 2.6;
    const pupilRadius = 1.3;

    let e1 = { x: 0, y: 0 };
    let e2 = { x: 0, y: 0 };

    if (dir === 'right') {
      e1 = { x: cx + offset * 0.8, y: cy - offset };
      e2 = { x: cx + offset * 0.8, y: cy + offset };
    } else if (dir === 'left') {
      e1 = { x: cx - offset * 0.8, y: cy - offset };
      e2 = { x: cx - offset * 0.8, y: cy + offset };
    } else if (dir === 'up') {
      e1 = { x: cx - offset, y: cy - offset * 0.8 };
      e2 = { x: cx + offset, y: cy - offset * 0.8 };
    } else if (dir === 'down') {
      e1 = { x: cx - offset, y: cy + offset * 0.8 };
      e2 = { x: cx + offset, y: cy + offset * 0.8 };
    }

    const pupilColor = currentTheme === 'dark' ? '#0b0f17' : '#0f172a';

    [e1, e2].forEach(p => {
      // White Sclera
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, eyeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = pupilColor;
      ctx.beginPath();
      ctx.arc(p.x, p.y, pupilRadius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }

  // =========================================================================
  // OVERLAYS MANAGEMENT
  // =========================================================================

  function showOverlay(type) {
    startBox.classList.add('hidden');
    pauseBox.classList.add('hidden');
    gameOverBox.classList.add('hidden');

    if (type === 'start') {
      startBox.classList.remove('hidden');
    } else if (type === 'pause') {
      pauseBox.classList.remove('hidden');
    } else if (type === 'gameover') {
      gameOverBox.classList.remove('hidden');
    }

    overlay.classList.remove('hidden');
  }

  function hideOverlays() {
    overlay.classList.add('hidden');
  }

  // =========================================================================
  // CONTROLS & EVENTS
  // =========================================================================

  function changeDirection(newDir) {
    const opposites = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left'
    };

    const last = inputQueue.length > 0 ? inputQueue[inputQueue.length - 1] : direction;
    if (newDir !== opposites[last] && newDir !== last) {
      if (inputQueue.length < 2) {
        inputQueue.push(newDir);
      }
    }
  }

  function toggleSound() {
    audio.muted = !audio.muted;
    localStorage.setItem('snake_muted', audio.muted ? 'true' : 'false');
    updateSoundUI();
    if (!audio.muted) audio.playEat();
  }

  function updateSoundUI() {
    soundIcon.textContent = audio.muted ? '🔇' : '🔊';
    soundBtn.setAttribute('title', audio.muted ? 'Unmute Sound (M)' : 'Mute Sound (M)');
  }

  function setupEvents() {
    // Keyboard
    window.addEventListener('keydown', e => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        if (!isRunning) {
          startGame();
        } else {
          pauseGame();
        }
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        startGame();
        return;
      }

      if (e.key === 'm' || e.key === 'M') {
        toggleSound();
        return;
      }

      if (e.key === 't' || e.key === 'T') {
        toggleTheme();
        return;
      }

      const map = {
        ArrowUp: 'up', w: 'up', W: 'up',
        ArrowDown: 'down', s: 'down', S: 'down',
        ArrowLeft: 'left', a: 'left', A: 'left',
        ArrowRight: 'right', d: 'right', D: 'right'
      };

      if (map[e.key]) {
        if (!isRunning) startGame();
        changeDirection(map[e.key]);
      }
    });

    // Touch Swiping on Canvas
    let startX = 0;
    let startY = 0;

    canvas.addEventListener('touchstart', e => {
      if (e.touches.length > 0) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    }, { passive: true });

    canvas.addEventListener('touchend', e => {
      if (e.changedTouches.length > 0) {
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        const threshold = 20;

        if (!isRunning) {
          startGame();
          return;
        }

        if (Math.abs(dx) > Math.abs(dy)) {
          if (Math.abs(dx) > threshold) {
            changeDirection(dx > 0 ? 'right' : 'left');
          }
        } else {
          if (Math.abs(dy) > threshold) {
            changeDirection(dy > 0 ? 'down' : 'up');
          }
        }
      }
    }, { passive: true });

    // Buttons
    themeBtn.addEventListener('click', toggleTheme);
    soundBtn.addEventListener('click', toggleSound);
    restartBtn.addEventListener('click', startGame);

    startBtn.addEventListener('click', startGame);
    resumeBtn.addEventListener('click', pauseGame);
    playAgainBtn.addEventListener('click', startGame);

    // Mobile Virtual Touch buttons
    document.querySelectorAll('.t-btn').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (!isRunning) startGame();
        changeDirection(btn.dataset.dir);
      });
    });
  }

  // Run Bootstrap
  document.addEventListener('DOMContentLoaded', init);

})();