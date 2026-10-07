"use client";

import { useEffect, useRef, useState } from "react";

const SCRAMBLE_GLYPHS = "$#&*@!_-./|<>0123456789";
const PRE_HOLD_MS = 40;
const REVEAL_DURATION_MS = 400;
const FLASH_MS = 90;
const GLYPH_SWAP_MS = 50;

// Drives a ScrambleText from whatever element should own the hover. Spread the
// returned handlers on that element and pass `run` down to <ScrambleText />.
export function useScramble() {
  const [run, setRun] = useState({ active: false, id: 0 });
  const activeRef = useRef(false);

  // A new object identity per start guarantees a replay; stopping while already
  // stopped keeps the same object so it costs no render.
  const start = () => {
    activeRef.current = true;
    setRun((current) => ({ active: true, id: current.id + 1 }));
  };

  const stop = () => {
    activeRef.current = false;
    setRun((current) =>
      current.active ? { active: false, id: current.id } : current
    );
  };

  return {
    run,
    handlers: {
      onPointerEnter: start,
      onPointerLeave: stop,
      onPointerMove: () => {
        // Recovers the hover when the element moved under a stationary cursor
        // (the navbar hides/reveals on scroll) and no pointerenter was fired.
        if (!activeRef.current) start();
      },
      onFocus: start,
      onBlur: stop,
    },
  };
}

// Prefer `preColor` / `flashColor` props. CSS custom properties remain as a
// fallback for callers that still set --scramble-pre / --scramble-flash.
export default function ScrambleText({
  text,
  run,
  className = "",
  preColor,
  flashColor = "#7E013D",
}) {
  const charsRef = useRef([]);
  const active = run.active;

  useEffect(() => {
    const chars = charsRef.current.slice(0, text.length).filter(Boolean);
    if (!chars.length) return;

    const pre = preColor || "var(--scramble-pre)";
    const flash = flashColor || "var(--scramble-flash)";

    const settle = () => {
      chars.forEach((node, index) => {
        node.textContent = text[index];
        node.style.color = "";
      });
    };

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!active || prefersReducedMotion) {
      settle();
      return;
    }

    const start = performance.now();
    let previous = start;
    let frame = 0;

    const tick = (now) => {
      const elapsed = now - start;
      const swapChance = (now - previous) / GLYPH_SWAP_MS;

      previous = now;

      let running = false;

      chars.forEach((node, index) => {
        const revealAt =
          PRE_HOLD_MS + ((index + 1) / chars.length) * REVEAL_DURATION_MS;
        const final = text[index];

        if (elapsed < revealAt) {
          running = true;
          node.style.color = pre;

          if (final !== " " && Math.random() < swapChance) {
            node.textContent =
              SCRAMBLE_GLYPHS[
                Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)
              ];
          }

          return;
        }

        node.textContent = final;

        if (elapsed - revealAt < FLASH_MS) {
          running = true;
          node.style.color = flash;
        } else {
          node.style.color = "";
        }
      });

      if (running) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
    // `run` identity changes on every hover start, so each hover replays the
    // scramble even if the previous pointerleave was never delivered.
  }, [run, text, preColor, flashColor]);

  return (
    <span className={`relative block ${className}`}>
      <span aria-hidden="true" className="invisible whitespace-pre">
        {text}
      </span>
      <span aria-hidden="true" className="absolute inset-0 whitespace-pre">
        {Array.from(text).map((character, index) => (
          <span
            key={index}
            ref={(node) => {
              charsRef.current[index] = node;
            }}
            className="inline-block transition-colors duration-200 ease-out motion-reduce:transition-none"
          >
            {character}
          </span>
        ))}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
