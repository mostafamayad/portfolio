// ============================================================
// PARTICLES.JS — Canvas Particle System
// ============================================================

class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null };
    this.animFrame = null;

    this.config = {
      count: 80,
      maxRadius: 2.5,
      minRadius: 0.5,
      speed: 0.3,
      colors: ['#7c3aed', '#a855f7', '#06b6d4', '#ffffff'],
      connectDistance: 120,
      mouseRepelDistance: 100,
      opacity: 0.6
    };

    this.resize();
    this.init();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    this.particles = [];
    for (let i = 0; i < this.config.count; i++) {
      this.particles.push(new Particle(this.canvas, this.config));
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.init();
    });

    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((p, i) => {
      p.update(this.mouse);
      p.draw(this.ctx);

      // Draw connections
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = p.x - this.particles[j].x;
        const dy = p.y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.config.connectDistance) {
          const opacity = (1 - dist / this.config.connectDistance) * 0.15;
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(124,58,237,${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    });

    this.animFrame = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  }
}

class Particle {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.config = config;
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.radius = Math.random() * (this.config.maxRadius - this.config.minRadius) + this.config.minRadius;
    this.color = this.config.colors[Math.floor(Math.random() * this.config.colors.length)];
    this.opacity = Math.random() * 0.5 + 0.1;
    this.vx = (Math.random() - 0.5) * this.config.speed * 2;
    this.vy = (Math.random() - 0.5) * this.config.speed * 2;
    this.pulseSpeed = Math.random() * 0.02 + 0.005;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.life = 0;
  }

  update(mouse) {
    this.life += this.pulseSpeed;
    this.x += this.vx;
    this.y += this.vy;

    // Mouse repel
    if (mouse.x !== null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.config.mouseRepelDistance) {
        const force = (this.config.mouseRepelDistance - dist) / this.config.mouseRepelDistance;
        this.vx += (dx / dist) * force * 0.5;
        this.vy += (dy / dist) * force * 0.5;
      }
    }

    // Friction
    this.vx *= 0.99;
    this.vy *= 0.99;

    // Speed limit
    const maxSpeed = this.config.speed * 3;
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > maxSpeed) {
      this.vx = (this.vx / speed) * maxSpeed;
      this.vy = (this.vy / speed) * maxSpeed;
    }

    // Bounce or wrap
    if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1;

    // Clamp
    this.x = Math.max(0, Math.min(this.canvas.width, this.x));
    this.y = Math.max(0, Math.min(this.canvas.height, this.y));
  }

  draw(ctx) {
    const pulse = Math.sin(this.life) * 0.3 + 0.7;
    const r = this.radius * pulse;
    const op = this.opacity * pulse;

    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fillStyle = this.hexToRgba(this.color, op);
    ctx.fill();

    // Glow
    if (this.radius > 1.5) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 2, 0, Math.PI * 2);
      ctx.fillStyle = this.hexToRgba(this.color, op * 0.1);
      ctx.fill();
    }
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
}

// Init
window.particleSystem = null;
document.addEventListener('DOMContentLoaded', () => {
  window.particleSystem = new ParticleSystem('particles-canvas');
});
