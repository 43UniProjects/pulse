'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

type BloodRainProps = {
  /** Drops per second falling from the top of the screen. */
  rain?: number;
  /** Maximum pool depth as a fraction of screen height. */
  maxPool?: number;
  className?: string;
};

type Drop = { x: number; y: number; vy: number; r: number };
type Bit = { x: number; y: number; vx: number; vy: number; r: number };

type Palette = {
  dropEdge: string;
  dropMid: string;
  dropCore: string;
  highlight: string;
  bit: string;
  poolTop: string;
  poolMid: string;
  poolBottom: string;
  surfaceLine: string;
  sheen: string;
};

const LIGHT: Palette = {
  dropEdge: '#6b0009',
  dropMid: '#c4101e',
  dropCore: '#4a0006',
  highlight: 'rgba(255, 255, 255, 0.55)',
  bit: '#a80c19',
  poolTop: 'rgba(176, 8, 22, 0.97)',
  poolMid: '#730510',
  poolBottom: '#2b0005',
  surfaceLine: 'rgba(255, 120, 120, 0.5)',
  sheen: 'rgba(255, 255, 255, 0.2)',
};

const DARK: Palette = {
  dropEdge: '#9c0f1b',
  dropMid: '#ff3344',
  dropCore: '#78061a',
  highlight: 'rgba(255, 225, 225, 0.55)',
  bit: '#e01f30',
  poolTop: 'rgba(214, 22, 40, 0.96)',
  poolMid: '#8f0816',
  poolBottom: '#3d0409',
  surfaceLine: 'rgba(255, 140, 140, 0.6)',
  sheen: 'rgba(255, 255, 255, 0.12)',
};

const COL = 6; // px between surface columns
const G = 500; // gravity, px/s^2
const TERM = 1700; // terminal velocity, px/s
const STEP = 1 / 60; // fixed step for the surface springs

export default function BloodRain({
  rain = 3,
  maxPool = 0.22,
  className = '',
}: BloodRainProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const islogin =
    pathname?.includes('/donor') ||
    pathname?.includes('/hospital') ||
    pathname?.includes('/admin');

  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    if (!islogin) return;
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      setIsIdle(false);
      timeoutId = setTimeout(() => {
        setIsIdle(true);
      }, 5000);
    };
    resetTimer();

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('touchstart', resetTimer);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [islogin]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const scheme = window.matchMedia('(prefers-color-scheme: dark)');
    const rnd = Math.random;

    // Respects a `dark` / `light` class or `data-theme` on <html>

    const readPalette = (): Palette => {
      const el = document.documentElement;
      let dark = scheme.matches;
      if (el.classList.contains('dark')) dark = true;
      else if (el.classList.contains('light')) dark = false;
      else {
        const attr = el.getAttribute('data-theme');
        if (attr === 'dark') dark = true;
        else if (attr === 'light') dark = false;
      }
      return dark ? DARK : LIGHT;
    };
    let pal = readPalette();

    const onTheme = () => {
      pal = readPalette();
      if (reduce) draw(0);
    };
    const observer = new MutationObserver(onTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });
    scheme.addEventListener('change', onTheme);

    /* ---------- state ---------- */

    let W = 0;
    let H = 0;
    let n = 0;
    let h = new Float32Array(0); // surface displacement (positive = up)
    let v = new Float32Array(0); // surface velocity
    let ld = new Float32Array(0);
    let rd = new Float32Array(0);
    let level = 10; // base pool depth in px

    const drops: Drop[] = [];
    const bits: Bit[] = [];

    const maxLevel = () => H * maxPool;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      n = Math.ceil(W / COL) + 2;
      h = new Float32Array(n);
      v = new Float32Array(n);
      ld = new Float32Array(n);
      rd = new Float32Array(n);
      level = Math.min(level, maxLevel());
      if (reduce) draw(0);
    };

    const surfaceAt = (x: number) => {
      const f = Math.max(0, Math.min(n - 2, x / COL));
      const i = Math.floor(f);
      const k = f - i;
      return H - level - (h[i] * (1 - k) + h[i + 1] * k);
    };

    const stepWaves = () => {
      for (let i = 0; i < n; i++) {
        v[i] += -0.02 * h[i] - 0.018 * v[i];
        h[i] += v[i];
      }
      for (let p = 0; p < 4; p++) {
        for (let i = 0; i < n; i++) {
          if (i > 0) {
            ld[i] = 0.22 * (h[i] - h[i - 1]);
            v[i - 1] += ld[i];
          }
          if (i < n - 1) {
            rd[i] = 0.22 * (h[i] - h[i + 1]);
            v[i + 1] += rd[i];
          }
        }
        for (let i = 0; i < n; i++) {
          if (i > 0) h[i - 1] += ld[i];
          if (i < n - 1) h[i + 1] += rd[i];
        }
      }
    };

    const splash = (x: number, vy: number, r: number) => {
      const c = Math.round(x / COL);
      const impulse = r * 0.55 + vy * 0.0022;
      for (let k = -2; k <= 2; k++) {
        const j = c + k;
        if (j >= 0 && j < n) v[j] -= impulse * (1 - Math.abs(k) / 3);
      }
      level = Math.min(level + r * 0.012, maxLevel());

      const surf = surfaceAt(x);
      const count = Math.min(14, Math.round(3 + r * 0.8 + vy / 350));
      for (let i = 0; i < count; i++) {
        bits.push({
          x: x + (rnd() - 0.5) * r,
          y: surf - 1,
          vx: (rnd() - 0.5) * 260 * (0.4 + r / 8),
          vy: -(120 + rnd() * (180 + vy * 0.3)) * (0.6 + rnd() * 0.6),
          r: Math.max(0.8, r * (0.12 + rnd() * 0.25)),
        });
      }
    };

    const update = (dt: number) => {
      if (rnd() < rain * dt) {
        drops.push({
          x: rnd() * W,
          y: -30,
          vy: 250 + rnd() * 450,
          r: 3 + rnd() * 4.5,
        });
      }

      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.vy = Math.min(d.vy + G * dt, TERM);
        d.y += d.vy * dt;
        if (d.y + d.r * 0.9 >= surfaceAt(d.x)) {
          splash(d.x, d.vy, d.r);
          drops.splice(i, 1);
        }
      }

      for (let i = bits.length - 1; i >= 0; i--) {
        const b = bits[i];
        b.vy += G * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.x < 0 || b.x > W) {
          bits.splice(i, 1);
        } else if (b.vy > 0 && b.y >= surfaceAt(b.x)) {
          const j = Math.round(b.x / COL);
          if (j >= 0 && j < n) v[j] -= b.r * 0.25;
          bits.splice(i, 1);
        }
      }
    };

    /* ---------- drawing ---------- */

    const drawDrop = (d: Drop) => {
      const { x, y, r, vy } = d;
      const L = r * (1.5 + (vy / TERM) * 3.2);
      ctx.beginPath();
      ctx.moveTo(x, y - r - L);
      ctx.quadraticCurveTo(x - r, y - r * 0.9, x - r, y);
      ctx.arc(x, y, r, Math.PI, 0, true);
      ctx.quadraticCurveTo(x + r, y - r * 0.9, x, y - r - L);
      ctx.closePath();

      const g = ctx.createLinearGradient(x - r, 0, x + r, 0);
      g.addColorStop(0, pal.dropEdge);
      g.addColorStop(0.45, pal.dropMid);
      g.addColorStop(1, pal.dropCore);
      ctx.fillStyle = g;
      ctx.fill();

      ctx.fillStyle = pal.highlight;
      ctx.beginPath();
      ctx.ellipse(
        x - r * 0.38,
        y - r * 0.15,
        r * 0.18,
        r * 0.38,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    };

    const drawPool = (time: number) => {
      const ys: number[] = [];
      for (let i = 0; i < n; i++) {
        ys.push(
          H -
            level -
            h[i] +
            Math.sin(time * 1.1 + i * 0.21) * 1.4 +
            Math.sin(time * 0.6 + i * 0.07) * 2,
        );
      }
      const line = new Path2D();
      line.moveTo(0, ys[0]);
      for (let i = 1; i < n; i++) {
        const mx = ((i - 1) * COL + i * COL) / 2;
        line.quadraticCurveTo(
          (i - 1) * COL,
          ys[i - 1],
          mx,
          (ys[i - 1] + ys[i]) / 2,
        );
      }
      line.lineTo((n - 1) * COL, ys[n - 1]);

      const fill = new Path2D(line);
      fill.lineTo((n - 1) * COL, H + 2);
      fill.lineTo(0, H + 2);
      fill.closePath();

      const top = H - level - 24;
      const g = ctx.createLinearGradient(0, top, 0, H);
      g.addColorStop(0, pal.poolTop);
      g.addColorStop(0.4, pal.poolMid);
      g.addColorStop(1, pal.poolBottom);
      ctx.fillStyle = g;
      ctx.fill(fill);

      ctx.lineJoin = 'round';
      ctx.strokeStyle = pal.surfaceLine;
      ctx.lineWidth = 1.6;
      ctx.stroke(line);

      ctx.save();
      ctx.translate(0, 5);
      ctx.strokeStyle = pal.sheen;
      ctx.lineWidth = 3;
      ctx.stroke(line);
      ctx.restore();
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, W, H);
      drawPool(time);
      ctx.fillStyle = pal.bit;
      for (const b of bits) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
      for (const d of drops) drawDrop(d);
    };

    /* ---------- loop ---------- */

    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    if (reduce) {
      level = maxLevel() * 0.4;
      draw(0);
    } else {
      let last = performance.now();
      let acc = 0;
      let time = 0;
      const frame = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        time += dt;
        acc += dt;
        while (acc >= STEP) {
          stepWaves();
          acc -= STEP;
        }
        update(dt);
        draw(time);
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      scheme.removeEventListener('change', onTheme);
      observer.disconnect();
    };
  }, [rain, maxPool]);

  const isVisible = !islogin || isIdle;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`}
    >
      <canvas ref={ref} className="block h-full w-full" />
    </div>
  );
}
