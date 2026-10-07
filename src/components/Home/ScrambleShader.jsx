"use client";
import React, { useEffect, useRef } from "react";

const DEFAULT_CONFIG = {
  charSize: 10,
  hoverRadius: 200,
  baseOpacity: 0.06,
  hoverOpacity: .35,
  textColor: "#FF50A7",
  symbols: "VERDIKT@#$%^&*+-=~|:;<>?,./!",
  scrambleRatio: 0.28, // share of glyphs re-rolled per interval, on average
  scrambleIntervalMs: 300, // window that share is measured over
  followMs: 70, // how fast the glow catches the pointer
  fadeMs: 320, // fade in / out of the hover radius
  burstMs: 2000,
  burstOpacity: 0.99,
  burstBand: 200,
};

// Frame-rate independent smoothing: how far to move toward the target this frame.
// Using exp() keeps the easing identical at 60Hz, 120Hz or after a dropped frame.
const approach = (tau, dt) => (tau <= 0 ? 1 : 1 - Math.exp(-dt / tau));
const smoothstep = (t) => t * t * (3 - 2 * t);

// Wait time of a Poisson process. It is memoryless, so a cell's next flip
// carries no trace of its last one — cells cannot drift into step with each
// other and no repeating shape can settle into the field.
const nextDelay = (mean) => -Math.log(1 - Math.random()) * mean;

export default function ScrambleShader(props) {
  const canvasRef = useRef(null);
  const config = { ...DEFAULT_CONFIG, ...props };

  // Live config, so timings/radius can change without tearing down the loop.
  // Synced in an effect rather than during render, which React Compiler forbids.
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    // The grid at rest lives on its own canvas. Cells are repainted one at a
    // time as they come due, so a frame costs one drawImage plus the handful
    // of cells that flipped, never a full redraw.
    const base = document.createElement("canvas");
    const baseCtx = base.getContext("2d");
    if (!ctx || !baseCtx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let cssW = 0;
    let cssH = 0;
    let dpr = 0;
    let cols = 0;
    let rows = 0;
    let cellW = 0;
    // Rows sit slightly further apart than the glyphs are tall, so a cell's ink
    // never crosses into its neighbours. That is what makes clearing a single
    // cell safe — no descender from the row above gets erased, no seams.
    let cellH = 0;
    let baseline = 0;
    let chars = [];
    let alphas = new Float32Array(0);
    let nextAt = new Float64Array(0);
    let rect = canvas.getBoundingClientRect();

    const pointer = { x: 0, y: 0 };
    const glow = { x: 0, y: 0 };
    let hoverTarget = 0;
    let hover = 0;
    let raf = 0;
    let last = 0;
    const waves = [];

    const pickChar = () => {
      const symbols = configRef.current.symbols;
      return symbols[(Math.random() * symbols.length) | 0];
    };

    // Brightness is re-rolled with the glyph. Left fixed it reads as a permanent
    // constellation of bright cells — a static pattern the eye locks onto while
    // only the glyph shapes change underneath it.
    const pickAlpha = () => configRef.current.baseOpacity * (0.5 + Math.random());

    // Average gap between one cell's flips, derived so the configured ratio
    // still describes how much of the grid turns over per interval.
    const meanDelay = () => {
      const { scrambleIntervalMs, scrambleRatio } = configRef.current;
      return Math.max(16, scrambleIntervalMs / Math.max(0.01, scrambleRatio));
    };

    const buildGrid = () => {
      const { charSize } = configRef.current;
      cellW = charSize;
      cellH = Math.round(charSize * 1.25);
      baseline = Math.round(charSize * 0.95);
      cols = Math.ceil(cssW / cellW) + 1;
      rows = Math.ceil(cssH / cellH) + 1;

      const total = cols * rows;
      const mean = meanDelay();
      const now = performance.now();
      chars = new Array(total);
      alphas = new Float32Array(total);
      nextAt = new Float64Array(total);
      for (let i = 0; i < total; i++) {
        chars[i] = pickChar();
        alphas[i] = pickAlpha();
        nextAt[i] = now + nextDelay(mean);
      }
    };

    const paintCell = (i, row, col) => {
      const x = col * cellW;
      const y = row * cellH;
      baseCtx.clearRect(x, y, cellW, cellH);
      baseCtx.globalAlpha = alphas[i];
      baseCtx.fillText(chars[i], x, y + baseline);
      baseCtx.globalAlpha = 1;
    };

    const paintBase = () => {
      baseCtx.clearRect(0, 0, cssW, cssH);
      for (let row = 0; row < rows; row++) {
        const offset = row * cols;
        for (let col = 0; col < cols; col++) paintCell(offset + col, row, col);
      }
    };

    const measure = () => {
      rect = canvas.getBoundingClientRect();
    };

    const resize = () => {
      measure();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      // Cap DPR at 2 — beyond that the extra fill rate buys nothing visible.
      const d = Math.min(window.devicePixelRatio || 1, 2);
      if (w === cssW && h === cssH && d === dpr) return;

      cssW = w;
      cssH = h;
      dpr = d;
      canvas.width = base.width = Math.round(w * d);
      canvas.height = base.height = Math.round(h * d);
      // Resizing a canvas resets its context, so restore state afterwards.
      const font = `bold ${configRef.current.charSize}px monospace`;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      ctx.font = font;
      ctx.fillStyle = configRef.current.textColor;
      ctx.textBaseline = "alphabetic";
      baseCtx.setTransform(d, 0, 0, d, 0, 0);
      baseCtx.font = font;
      baseCtx.fillStyle = configRef.current.textColor;
      baseCtx.textBaseline = "alphabetic";
      buildGrid();
      paintBase();
    };

    const onPointerMove = (e) => {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const inside = x >= 0 && y >= 0 && x <= cssW && y <= cssH;
      // Snap on entry so the glow appears under the cursor instead of sliding in.
      if (inside && hover === 0) {
        glow.x = x;
        glow.y = y;
      }
      pointer.x = x;
      pointer.y = y;
      hoverTarget = inside ? 1 : 0;
    };

    const onPointerGone = () => {
      hoverTarget = 0;
    };

    const onPointerDown = (e) => {
      if (e.button !== 0 || reduceMotion.matches) return;
      measure();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > cssW || y > cssH) return;

      const cfg = configRef.current;
      waves.push({
        x,
        y,
        born: performance.now(),
        duration: cfg.burstMs,
        maxRadius: Math.hypot(cssW, cssH) * 0.85,
        lastRadius: 0,
      });
      if (waves.length > 4) waves.shift();
    };

    const paintBoost = (cx, cy, radius, band, strength) => {
      if (strength <= 0 || radius <= 0) return;
      const outer = radius + band * 0.4;
      const outerSq = outer * outer;
      const colStart = Math.max(0, Math.floor((cx - outer) / cellW));
      const colEnd = Math.min(cols - 1, Math.floor((cx + outer) / cellW));
      const rowStart = Math.max(0, Math.floor((cy - outer) / cellH));
      const rowEnd = Math.min(rows - 1, Math.floor((cy + outer) / cellH));

      for (let row = rowStart; row <= rowEnd; row++) {
        const y = row * cellH;
        const dy = y + cellH * 0.5 - cy;
        const offset = row * cols;
        for (let col = colStart; col <= colEnd; col++) {
          const dx = col * cellW + cellW * 0.5 - cx;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist * dist >= outerSq) continue;

          const ring = 1 - Math.min(1, Math.abs(dist - radius) / band);
          const boost = Math.min(1, smoothstep(ring) * strength);
          const rest = alphas[offset + col];
          if (boost <= rest + 0.004) continue;

          ctx.globalAlpha = (boost - rest) / (1 - rest);
          ctx.fillText(chars[offset + col], col * cellW, y + baseline);
        }
      }
    };

    const scrambleRing = (wave, radius) => {
      const from = wave.lastRadius;
      const to = radius;
      if (to <= from) return;
      const pad = cellW;
      const colStart = Math.max(0, Math.floor((wave.x - to - pad) / cellW));
      const colEnd = Math.min(cols - 1, Math.floor((wave.x + to + pad) / cellW));
      const rowStart = Math.max(0, Math.floor((wave.y - to - pad) / cellH));
      const rowEnd = Math.min(rows - 1, Math.floor((wave.y + to + pad) / cellH));

      for (let row = rowStart; row <= rowEnd; row++) {
        const dy = row * cellH + cellH * 0.5 - wave.y;
        const offset = row * cols;
        for (let col = colStart; col <= colEnd; col++) {
          const dx = col * cellW + cellW * 0.5 - wave.x;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < from || dist > to) continue;
          const i = offset + col;
          chars[i] = pickChar();
          alphas[i] = pickAlpha();
          paintCell(i, row, col);
        }
      }
      wave.lastRadius = to;
    };

    const render = (now) => {
      raf = requestAnimationFrame(render);
      const dt = last ? Math.min(now - last, 64) : 16;
      last = now;
      const cfg = configRef.current;

      const follow = approach(cfg.followMs, dt);
      glow.x += (pointer.x - glow.x) * follow;
      glow.y += (pointer.y - glow.y) * follow;
      hover += (hoverTarget - hover) * approach(cfg.fadeMs, dt);
      if (hover < 0.002) hover = 0;

      if (!reduceMotion.matches) {
        // Every cell keeps its own due time, so flips land scattered across
        // frames instead of the whole grid turning over on one shared tick.
        const total = cols * rows;
        const mean = meanDelay();
        for (let i = 0; i < total; i++) {
          if (now < nextAt[i]) continue;
          const row = (i / cols) | 0;
          chars[i] = pickChar();
          alphas[i] = pickAlpha();
          paintCell(i, row, i - row * cols);
          // Rescheduled from now rather than from the due time, so a
          // backgrounded tab resumes calmly instead of firing a catch-up burst.
          nextAt[i] = now + nextDelay(mean);
        }
      }

      ctx.clearRect(0, 0, cssW, cssH);
      ctx.drawImage(base, 0, 0, cssW, cssH);

      if (hover > 0) {
        const { hoverRadius, hoverOpacity } = cfg;
        const radiusSq = hoverRadius * hoverRadius;
        const colStart = Math.max(0, Math.floor((glow.x - hoverRadius) / cellW));
        const colEnd = Math.min(cols - 1, Math.floor((glow.x + hoverRadius) / cellW));
        const rowStart = Math.max(0, Math.floor((glow.y - hoverRadius) / cellH));
        const rowEnd = Math.min(rows - 1, Math.floor((glow.y + hoverRadius) / cellH));

        for (let row = rowStart; row <= rowEnd; row++) {
          const y = row * cellH;
          const dy = y + cellH * 0.5 - glow.y;
          const offset = row * cols;
          for (let col = colStart; col <= colEnd; col++) {
            const dx = col * cellW + cellW * 0.5 - glow.x;
            const distSq = dx * dx + dy * dy;
            if (distSq >= radiusSq) continue;

            const boost = Math.min(
              1,
              smoothstep(1 - Math.sqrt(distSq) / hoverRadius) * hoverOpacity * hover
            );
            const rest = alphas[offset + col];
            if (boost <= rest + 0.004) continue;

            ctx.globalAlpha = (boost - rest) / (1 - rest);
            ctx.fillText(chars[offset + col], col * cellW, y + baseline);
          }
        }
      }

      for (let w = waves.length - 1; w >= 0; w--) {
        const wave = waves[w];
        const t = (now - wave.born) / wave.duration;
        if (t >= 1) {
          waves.splice(w, 1);
          continue;
        }
        const eased = 1 - (1 - t) * (1 - t);
        const radius = eased * wave.maxRadius;
        scrambleRing(wave, radius);
        paintBoost(
          wave.x,
          wave.y,
          radius,
          cfg.burstBand * (1.2 - t * 0.2),
          cfg.burstOpacity * (1 - t),
        );
      }

      ctx.globalAlpha = 1;
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    raf = requestAnimationFrame(render);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointercancel", onPointerGone);
    window.addEventListener("blur", onPointerGone);
    document.addEventListener("pointerleave", onPointerGone);
    window.addEventListener("scroll", measure, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointercancel", onPointerGone);
      window.removeEventListener("blur", onPointerGone);
      document.removeEventListener("pointerleave", onPointerGone);
      window.removeEventListener("scroll", measure);
    };
  }, [config.charSize, config.symbols, config.textColor, config.baseOpacity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 block h-full w-full pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
