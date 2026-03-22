/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useRef } from 'react';
import { useTheme, ThemeId } from './ThemeContext';

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// ─── SNOW ────────────────────────────────────────────────────────────────────

function spawnSnow(w: number, h: number) {
  return {
    x: rand(0, w), y: rand(-20, h),
    r: rand(2, 5),
    speed: rand(1, 2.5),
    drift: rand(-0.3, 0.3),
    wobble: rand(0, Math.PI * 2),
    wobbleSpeed: rand(0.01, 0.025),
    opacity: rand(0.5, 0.9),
  };
}

function updateSnow(p: any, w: number, h: number) {
  p.wobble += p.wobbleSpeed;
  p.x += Math.sin(p.wobble) * 0.4 + p.drift;
  p.y += p.speed;
  if (p.y > h + 10) { p.y = -10; p.x = rand(0, w); }
  if (p.x < -10) p.x = w + 10;
  if (p.x > w + 10) p.x = -10;
}

function drawSnow(ctx: CanvasRenderingContext2D, p: any) {
  ctx.save();
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#c0e0ff';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ─── RAIN ────────────────────────────────────────────────────────────────────

const RAIN_SIN = Math.sin(Math.PI / 6);
const RAIN_COS = Math.cos(Math.PI / 6);

function spawnRain(w: number, h: number) {
  return {
    x: rand(0, w), y: rand(-h, 0),
    length: rand(15, 30),
    speed: rand(18, 28),
    opacity: rand(0.2, 0.5),
  };
}

function spawnStormRain(w: number, h: number) {
  return {
    x: rand(0, w), y: rand(-h, 0),
    length: rand(22, 45),
    speed: rand(28, 45),
    opacity: rand(0.3, 0.65),
  };
}

function updateRain(p: any, w: number, h: number) {
  p.x += p.speed * RAIN_SIN;
  p.y += p.speed * RAIN_COS;
  if (p.y > h + 30) { p.y = rand(-100, 0); p.x = rand(0, w); }
}

function drawRain(ctx: CanvasRenderingContext2D, p: any) {
  ctx.save();
  ctx.globalAlpha = p.opacity;
  ctx.strokeStyle = '#8ab4d4';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x - p.length * RAIN_SIN, p.y - p.length * RAIN_COS);
  ctx.stroke();
  ctx.restore();
}

// ─── EMBERS ──────────────────────────────────────────────────────────────────

const EMBER_COLORS = ['#ff6b00', '#ff4500', '#ffcc00', '#ff8c00', '#ff3300', '#ffaa33'];

function spawnEmber(w: number, h: number) {
  return {
    x: rand(0, w),
    y: rand(h * 0.3, h + 20),
    r: rand(1, 3),
    speedY: rand(0.8, 2.5),
    drift: rand(-0.5, 0.5),
    life: rand(0, 1),
    lifeSpeed: rand(0.003, 0.008),
    color: EMBER_COLORS[Math.floor(rand(0, EMBER_COLORS.length))],
    wobble: rand(0, Math.PI * 2),
  };
}

function spawnInfernoEmber(w: number, h: number) {
  return {
    x: rand(0, w),
    y: rand(h * 0.5, h + 20),
    r: rand(1.5, 4),
    speedY: rand(1.2, 3.5),
    drift: rand(-0.8, 0.8),
    life: rand(0, 1),
    lifeSpeed: rand(0.004, 0.012),
    color: EMBER_COLORS[Math.floor(rand(0, EMBER_COLORS.length))],
    wobble: rand(0, Math.PI * 2),
  };
}

function updateEmber(p: any, w: number, h: number) {
  p.wobble += 0.05;
  p.y -= p.speedY;
  p.x += p.drift + Math.sin(p.wobble) * 0.4;
  p.life += p.lifeSpeed;
  if (p.life >= 1 || p.y < -20) {
    p.x = rand(0, w);
    p.y = rand(h * 0.5, h + 20);
    p.life = 0;
    p.speedY = rand(0.8, 2.5);
    p.drift = rand(-0.5, 0.5);
    p.color = EMBER_COLORS[Math.floor(rand(0, EMBER_COLORS.length))];
    p.wobble = rand(0, Math.PI * 2);
  }
  if (p.x < -10) p.x = w + 10;
  if (p.x > w + 10) p.x = -10;
}

function drawEmber(ctx: CanvasRenderingContext2D, p: any) {
  const opacity = Math.sin(p.life * Math.PI) * 0.9;
  ctx.save();
  ctx.globalAlpha = Math.max(0, opacity);
  ctx.fillStyle = p.color;
  ctx.shadowColor = p.color;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ─── WIND ────────────────────────────────────────────────────────────────────

function spawnWind(w: number, h: number) {
  return {
    x: rand(-200, w),
    y: rand(0, h),
    length: rand(60, 200),
    speed: rand(12, 22),
    opacity: rand(0.03, 0.15),
    thickness: rand(0.5, 1.5),
  };
}

function updateWind(p: any, w: number) {
  p.x += p.speed;
  if (p.x - p.length > w) p.x = rand(-200, -p.length);
}

function drawWind(ctx: CanvasRenderingContext2D, p: any) {
  ctx.save();
  const grad = ctx.createLinearGradient(p.x - p.length, p.y, p.x, p.y);
  grad.addColorStop(0, `rgba(255,255,255,0)`);
  grad.addColorStop(0.5, `rgba(220,230,255,${p.opacity})`);
  grad.addColorStop(1, `rgba(255,255,255,0)`);
  ctx.strokeStyle = grad;
  ctx.lineWidth = p.thickness;
  ctx.beginPath();
  ctx.moveTo(p.x - p.length, p.y);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  ctx.restore();
}

// ─── CHERRY BLOSSOMS ─────────────────────────────────────────────────────────

const PETAL_COLORS = ['#ffb7c5', '#ff9eb5', '#ffc0cb', '#ff85a1', '#ffe4e8', '#ffccd5'];

function spawnBlossom(w: number, h: number) {
  return {
    x: rand(0, w), y: rand(-20, h),
    size: rand(5, 10),
    speed: rand(0.6, 1.5),
    rotation: rand(0, Math.PI * 2),
    rotSpeed: rand(-0.025, 0.025),
    drift: rand(-0.5, 0.5),
    wobble: rand(0, Math.PI * 2),
    wobbleSpeed: rand(0.01, 0.022),
    color: PETAL_COLORS[Math.floor(rand(0, PETAL_COLORS.length))],
    opacity: rand(0.6, 1),
  };
}

function updateBlossom(p: any, w: number, h: number) {
  p.wobble += p.wobbleSpeed;
  p.rotation += p.rotSpeed;
  p.x += p.drift + Math.sin(p.wobble) * 0.8;
  p.y += p.speed;
  if (p.y > h + 20) { p.y = -20; p.x = rand(0, w); }
  if (p.x < -20) p.x = w + 20;
  if (p.x > w + 20) p.x = -20;
}

function drawBlossom(ctx: CanvasRenderingContext2D, p: any) {
  ctx.save();
  ctx.globalAlpha = p.opacity;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.fillStyle = p.color;
  ctx.shadowColor = p.color;
  ctx.shadowBlur = 4;
  const s = p.size;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.bezierCurveTo(s * 0.8, -s * 0.5, s * 0.8, s * 0.5, 0, s);
  ctx.bezierCurveTo(-s * 0.8, s * 0.5, -s * 0.8, -s * 0.5, 0, -s);
  ctx.fill();
  ctx.restore();
}

// ─── CONFIG TABLES ───────────────────────────────────────────────────────────

const SPAWN_FNS: Partial<Record<ThemeId, (w: number, h: number) => any>> = {
  snow:     spawnSnow,
  rain:     spawnRain,
  embers:   spawnEmber,
  inferno:  spawnInfernoEmber,
  wind:     spawnWind,
  blossoms: spawnBlossom,
  storm:    spawnStormRain,
};

const UPDATE_FNS: Partial<Record<ThemeId, (p: any, w: number, h: number) => void>> = {
  snow:     updateSnow,
  rain:     updateRain,
  embers:   updateEmber,
  inferno:  updateEmber,
  wind:     (p, w, h) => updateWind(p, w),
  blossoms: updateBlossom,
  storm:    updateRain,
};

const DRAW_FNS: Partial<Record<ThemeId, (ctx: CanvasRenderingContext2D, p: any) => void>> = {
  snow:     drawSnow,
  rain:     drawRain,
  embers:   drawEmber,
  inferno:  drawEmber,
  wind:     drawWind,
  blossoms: drawBlossom,
  storm:    drawRain,
};

const COUNTS: Record<ThemeId, number> = {
  none: 0, snow: 120, rain: 180, embers: 80,
  inferno: 160, wind: 60, blossoms: 60, storm: 280,
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function ThemeEffects() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    particles: [] as any[],
    lightning: { timer: 3000, flash: 0 },
    animId: 0,
    lastTime: 0,
  });

  useEffect(() => {
    if (theme === 'none') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = stateRef.current;
    state.lightning = { timer: rand(2000, 5000), flash: 0 };

    const initParticles = () => {
      const spawnFn = SPAWN_FNS[theme];
      if (!spawnFn) { state.particles = []; return; }
      state.particles = Array.from({ length: COUNTS[theme] }, () =>
        spawnFn(canvas.width, canvas.height)
      );
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', resize);
    resize();

    const loop = (time: number) => {
      const delta = time - (state.lastTime || time);
      state.lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ── per-theme overlays ──────────────────────────────────────────────────

      if (theme === 'inferno') {
        // warm bottom gradient
        const bottomGrad = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height);
        bottomGrad.addColorStop(0, 'rgba(200,40,0,0)');
        bottomGrad.addColorStop(1, 'rgba(160,25,0,0.38)');
        ctx.fillStyle = bottomGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // side vignette
        const leftGrad = ctx.createLinearGradient(0, 0, canvas.width * 0.25, 0);
        leftGrad.addColorStop(0, 'rgba(160,25,0,0.14)');
        leftGrad.addColorStop(1, 'rgba(160,25,0,0)');
        ctx.fillStyle = leftGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const rightGrad = ctx.createLinearGradient(canvas.width, 0, canvas.width * 0.75, 0);
        rightGrad.addColorStop(0, 'rgba(160,25,0,0.14)');
        rightGrad.addColorStop(1, 'rgba(160,25,0,0)');
        ctx.fillStyle = rightGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (theme === 'storm') {
        // dark atmosphere
        ctx.fillStyle = 'rgba(0,8,22,0.14)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // lightning
        const lt = state.lightning;
        lt.timer -= delta;
        if (lt.flash > 0) lt.flash = Math.max(0, lt.flash - delta * 0.007);
        if (lt.timer <= 0) {
          lt.flash = 1;
          lt.timer = rand(1800, 7000);
        }
        if (lt.flash > 0) {
          ctx.fillStyle = `rgba(180,205,255,${lt.flash * 0.38})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      if (theme === 'snow') {
        ctx.fillStyle = 'rgba(80,120,220,0.025)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // ── particles ──────────────────────────────────────────────────────────
      const updateFn = UPDATE_FNS[theme];
      const drawFn = DRAW_FNS[theme];
      if (updateFn && drawFn) {
        for (const p of state.particles) {
          updateFn(p, canvas.width, canvas.height);
          drawFn(ctx, p);
        }
      }

      state.animId = requestAnimationFrame(loop);
    };

    state.animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(state.animId);
      window.removeEventListener('resize', resize);
    };
  }, [theme]);

  if (theme === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}
