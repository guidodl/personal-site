class SnakeGame {
  constructor(container) {
    this.container = container;
    this.gridSize = 16;
    this.cols = 0;
    this.rows = 0;
    this.snake = { x: 0, y: 0, dx: 1, dy: 0, cells: [], maxCells: 4 };
    this.apple = { x: 0, y: 0 };
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
    this.count = 0;
    this.speed = 6;
    this.particles = [];
    this.running = true;
    this.paused = false;
    this.lastKeyTime = 0;

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    this.resize();
    this.initGame();
    this.bindEvents();
    this.loop();
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.cols = Math.floor(w / this.gridSize);
    this.rows = Math.floor(h / this.gridSize);
    this.canvas.width = this.cols * this.gridSize;
    this.canvas.height = this.rows * this.gridSize;
  }

  initGame() {
    this.snake = {
      x: Math.floor(this.cols / 2) * this.gridSize,
      y: Math.floor(this.rows / 2) * this.gridSize,
      dx: this.gridSize,
      dy: 0,
      cells: [],
      maxCells: 4
    };
    this.score = 0;
    this.particles = [];
    this.spawnApple();
    this.running = true;
    this.paused = false;
  }

  spawnApple() {
    this.apple.x = Math.floor(Math.random() * this.cols) * this.gridSize;
    this.apple.y = Math.floor(Math.random() * this.rows) * this.gridSize;
  }

  spawnParticles(x, y) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x + this.gridSize / 2,
        y: y + this.gridSize / 2,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1,
        decay: 0.03 + Math.random() * 0.03,
        color: 'hsl(' + (Math.random() * 60 + 260) + ', 80%, 65%)'
      });
    }
  }

  bindEvents() {
    this._keydown = (e) => {
      if (!this.running) {
        if (e.key === 'r' || e.key === 'R') {
          this.initGame();
        }
        return;
      }
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        this.paused = !this.paused;
        return;
      }
      if (this.paused) return;
      const now = Date.now();
      if (now - this.lastKeyTime < 50) return;
      this.lastKeyTime = now;

      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
          if (this.snake.dy === 0) {
            this.snake.dx = 0;
            this.snake.dy = -this.gridSize;
          }
          break;
        case 'ArrowDown': case 's': case 'S':
          if (this.snake.dy === 0) {
            this.snake.dx = 0;
            this.snake.dy = this.gridSize;
          }
          break;
        case 'ArrowLeft': case 'a': case 'A':
          if (this.snake.dx === 0) {
            this.snake.dx = -this.gridSize;
            this.snake.dy = 0;
          }
          break;
        case 'ArrowRight': case 'd': case 'D':
          if (this.snake.dx === 0) {
            this.snake.dx = this.gridSize;
            this.snake.dy = 0;
          }
          break;
      }
    };
    document.addEventListener('keydown', this._keydown);

    this._touchstart = (e) => {
      this._tx = e.changedTouches[0].pageX;
      this._ty = e.changedTouches[0].pageY;
      e.preventDefault();
    };
    this._touchmove = (e) => e.preventDefault();
    this._touchend = (e) => {
      if (!this.running) { this.initGame(); return; }
      if (this.paused) { this.paused = false; return; }
      const dx = e.changedTouches[0].pageX - this._tx;
      const dy = e.changedTouches[0].pageY - this._ty;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && this.snake.dx === 0) {
          this.snake.dx = this.gridSize;
          this.snake.dy = 0;
        } else if (dx < 0 && this.snake.dx === 0) {
          this.snake.dx = -this.gridSize;
          this.snake.dy = 0;
        }
      } else {
        if (dy > 0 && this.snake.dy === 0) {
          this.snake.dy = this.gridSize;
          this.snake.dx = 0;
        } else if (dy < 0 && this.snake.dy === 0) {
          this.snake.dy = -this.gridSize;
          this.snake.dx = 0;
        }
      }
      e.preventDefault();
    };
    document.addEventListener('touchstart', this._touchstart, { passive: false });
    document.addEventListener('touchmove', this._touchmove, { passive: false });
    document.addEventListener('touchend', this._touchend, { passive: false });

    this._resize = () => this.resize();
    window.addEventListener('resize', this._resize);
  }

  loop() {
    this._animFrame = requestAnimationFrame(() => this.loop());
    if (!this.running || this.paused) return;

    if (++this.count < (10 - Math.min(this.speed, 9))) return;
    this.count = 0;

    const s = this.snake;
    s.x += s.dx;
    s.y += s.dy;

    if (s.x < 0) this.die();
    else if (s.x >= this.canvas.width) this.die();
    if (s.y < 0) this.die();
    else if (s.y >= this.canvas.height) this.die();
    if (!this.running) return;

    s.cells.unshift({ x: s.x, y: s.y });
    if (s.cells.length > s.maxCells) s.cells.pop();

    const ctx = this.ctx;
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.globalAlpha = 0.03;
    ctx.strokeStyle = '#6c5ce7';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff5252';
    ctx.fillStyle = '#ff5252';
    ctx.fillRect(this.apple.x + 2, this.apple.y + 2, this.gridSize - 4, this.gridSize - 4);
    ctx.shadowBlur = 0;

    s.cells.forEach((cell, i) => {
      if (cell.x === this.apple.x && cell.y === this.apple.y) {
        s.maxCells++;
        this.score += 10;
        this.speed = Math.min(15, 6 + Math.floor(this.score / 50));
        this.spawnParticles(cell.x, cell.y);
        this.spawnApple();
      }
      for (let j = i + 1; j < s.cells.length; j++) {
        if (cell.x === s.cells[j].x && cell.y === s.cells[j].y) this.die();
      }
    });

    s.cells.forEach((cell, i) => {
      const t = i / (s.cells.length || 1);
      const hue = 260 + t * 60;
      const sat = 80 - t * 30;
      const light = 55 + t * 30;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'hsla(' + hue + ', ' + sat + '%, ' + light + '%, 0.6)';
      ctx.fillStyle = 'hsl(' + hue + ', ' + sat + '%, ' + light + '%)';
      const pad = i === 0 ? 1 : 2;
      ctx.fillRect(cell.x + pad, cell.y + pad, this.gridSize - pad * 2, this.gridSize - pad * 2);
    });
    ctx.shadowBlur = 0;

    this.particles = this.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) return false;
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      return true;
    });
    ctx.globalAlpha = 1;

    this.drawHud(ctx);
  }

  drawHud(ctx) {
    ctx.fillStyle = 'rgba(10,10,15,0.8)';
    ctx.fillRect(0, 0, this.canvas.width, 32);

    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#6c5ce7';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + this.score, 12, 16);

    ctx.fillStyle = '#a29bfe';
    ctx.textAlign = 'center';
    ctx.fillText('Best: ' + this.highScore, this.canvas.width / 2, 16);

    ctx.fillStyle = '#8888a0';
    ctx.textAlign = 'right';
    ctx.fillText('ESC to pause', this.canvas.width - 12, 16);

    if (this.paused) {
      ctx.fillStyle = 'rgba(10,10,15,0.6)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.fillStyle = '#e4e4ed';
      ctx.font = '32px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2 - 20);
      ctx.font = '14px "Inter", sans-serif';
      ctx.fillStyle = '#8888a0';
      ctx.fillText('Press ESC or tap to resume', this.canvas.width / 2, this.canvas.height / 2 + 20);
    }
  }

  die() {
    this.running = false;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('snakeHighScore', this.highScore);
    }
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(10,10,15,0.7)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.textAlign = 'center';

    ctx.fillStyle = '#ff5252';
    ctx.font = '40px "JetBrains Mono", monospace';
    ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);

    ctx.fillStyle = '#e4e4ed';
    ctx.font = '20px "JetBrains Mono", monospace';
    ctx.fillText('Score: ' + this.score, this.canvas.width / 2, this.canvas.height / 2 + 10);

    ctx.fillStyle = '#a29bfe';
    ctx.fillText('Best: ' + this.highScore, this.canvas.width / 2, this.canvas.height / 2 + 40);

    ctx.fillStyle = '#8888a0';
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText('Press R or tap to restart', this.canvas.width / 2, this.canvas.height / 2 + 75);
  }

  destroy() {
    cancelAnimationFrame(this._animFrame);
    document.removeEventListener('keydown', this._keydown);
    document.removeEventListener('touchstart', this._touchstart);
    document.removeEventListener('touchmove', this._touchmove);
    document.removeEventListener('touchend', this._touchend);
    window.removeEventListener('resize', this._resize);
    if (this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas);
  }
}
