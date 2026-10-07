"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import HeroBackdrop from "../Home/HeroBackdrop";
import { boxGeometry, morphClipPath, LAST_STAGE } from "@/utils/logoMorph";
import { useLoader } from "./LoaderContext";

gsap.registerPlugin(useGSAP);

const RUN = 1.8;
const DASH = "rgba(173, 0, 82, 0.4)";
const dashes = (direction) =>
  `repeating-linear-gradient(${direction}, ${DASH} 0 4px, transparent 4px 10px)`;

const STATUSES = [
  [0, "Initializing"],
  [22, "Setting type"],
  [48, "Loading assets"],
  [74, "Composing"],
  [96, "Ready"],
];

export default function Loader() {
  const { revealed, entered } = useLoader();
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    if (entered) lenis.start();
    else lenis.stop();
  }, [lenis, entered]);

  // Unmounting on the same commit that reveals the hero: by then the cube has
  // grown into the hero's own backdrop, so there is nothing left to cross-fade.
  return revealed ? null : <LoaderOverlay />;
}

function LoaderOverlay() {
  const { reveal } = useLoader();
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const gridRef = useRef(null);
  const chromeRef = useRef(null);
  const barRef = useRef(null);
  const fillRef = useRef(null);
  const countRef = useRef(null);
  const statusRef = useRef(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const stage = stageRef.current;
      const grid = gridRef.current;
      const chrome = chromeRef.current;
      const bar = barRef.current;
      const fill = fillRef.current;
      const countNode = countRef.current;
      const statusNode = statusRef.current;
      const lines = [...grid.querySelectorAll("[data-line]")];

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        reveal();
        return;
      }

      // `box` slides the clip between the centred cube (1) and the full window
      // (0); `morph` walks the mark through its stages. Opens on the finished
      // mark and unbuilds from there.
      const state = { progress: 0, box: 1, lines: 0 };
      let geo = boxGeometry(1, 1);
      let statusAt = -1;

      const SPREAD = 0.45;
      const drawLines = () => {
        const each = SPREAD / (lines.length - 1);
        lines.forEach((line, i) => {
          const t = (state.lines - i * each) / (1 - SPREAD);
          const p = Math.min(1, Math.max(0, t));
          const closed = (1 - p) * 50;
          line.style.clipPath =
            line.dataset.line === "v"
              ? `inset(${closed}% 0 ${closed}% 0)`
              : `inset(0 ${closed}% 0 ${closed}%)`;
        });
      };

      const draw = () => {
        const morph = LAST_STAGE * (1 - state.progress);
        stage.style.clipPath = morphClipPath(geo, state.box, morph);
        fill.style.transform = `scaleX(${state.progress})`;
        drawLines();

        const n = Math.round(state.progress * 100);
        countNode.textContent = String(n).padStart(3, "0");

        for (let i = STATUSES.length - 1; i >= 0; i--) {
          if (n >= STATUSES[i][0]) {
            if (statusAt !== i) {
              statusAt = i;
              statusNode.textContent = STATUSES[i][1];
            }
            break;
          }
        }
      };

      const layout = () => {
        const rect = root.getBoundingClientRect();
        geo = boxGeometry(rect.width, rect.height);
        const { vw, vh, w, h } = geo;

        const vLines = lines.filter((l) => l.dataset.line === "v");
        const hLines = lines.filter((l) => l.dataset.line === "h");
        vLines[0].style.left = `${(geo.x / vw) * 100}%`;
        vLines[1].style.left = `${((geo.x + w) / vw) * 100}%`;

        const outer = h / 3;
        [geo.y - outer, geo.y, geo.y + h, geo.y + h + outer].forEach((top, i) => {
          hLines[i].style.top = `${(top / vh) * 100}%`;
        });

        draw();
      };

      layout();
      window.addEventListener("resize", layout);

      const fades = chrome.querySelectorAll("[data-fade]");
      const incoming = chrome.querySelectorAll("[data-in]");
      gsap.set(fades, { opacity: 0 });
      gsap.set(incoming, { yPercent: 110 });
      gsap.set(bar, { yPercent: 100 });

      const ready = Promise.all([
        document.fonts?.ready ?? Promise.resolve(),
        document.readyState === "complete"
          ? Promise.resolve()
          : new Promise((done) =>
              window.addEventListener("load", done, { once: true })
            ),
      ]);

      let live = true;

      const exit = () => {
        gsap
          .timeline({ onUpdate: draw, onComplete: reveal })
          .to(fades, { opacity: 0, duration: 0.35, ease: "power2.in" }, 0)
          .to(incoming, { yPercent: -110, duration: 0.4, stagger: 0.04, ease: "power3.in" }, 0)
          .to(bar, { yPercent: 100, duration: 0.4, ease: "power3.in" }, 0)
          .to(state, { lines: 0, duration: 1.4, ease: "none" }, 0)
          .to(state, { box: 0, duration: 1, ease: "power3.inOut" }, ">");
      };

      gsap
        .timeline({ onUpdate: draw })
        .to(fades, { opacity: 1, duration: 0.7, stagger: 0.08, ease: "power2.out" }, 0)
        .to(bar, { yPercent: 0, duration: 0.5, ease: "power3.out" }, 0.2)
        .to(incoming, { yPercent: 0, duration: 0.7, stagger: 0.06, ease: "power3.out" }, 0.28)
        .to(state, { lines: 1, duration: 1.4, ease: "power2.out" }, 0.12)
        .to(state, { progress: 1, duration: RUN, ease: "power1.inOut" }, 0.2)
        .add(() => ready.then(() => live && exit()));

      return () => {
        live = false;
        window.removeEventListener("resize", layout);
      };
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="fixed inset-0 z-1000 overflow-hidden bg-white">
      <div ref={gridRef} className="pointer-events-none absolute inset-0 z-0">
        {[0, 1].map((i) => (
          <span
            key={`v${i}`}
            data-line="v"
            className="absolute top-0 h-full w-px"
            style={{ backgroundImage: dashes("to bottom"), clipPath: "inset(50% 0 50% 0)" }}
          />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <span
            key={`h${i}`}
            data-line="h"
            className="absolute left-0 h-px w-full"
            style={{ backgroundImage: dashes("to right"), clipPath: "inset(0 50% 0 50%)" }}
          />
        ))}
      </div>

      <div ref={stageRef} className="absolute inset-0 z-1">
        <HeroBackdrop />
      </div>

      <div
        ref={chromeRef}
        className="absolute inset-0 z-10 pointer-events-none text-secondary"
      >
        <div className="relative flex items-center justify-between px-[2vw] py-[1.2vw] max-md:px-[7%] max-md:py-5">
          <p data-fade className="text16 font-mono uppercase tracking-[0.04em]">
            Verdikt Studio
          </p>
          <p
            ref={countRef}
            data-fade
            className="text16 font-mono uppercase tracking-[0.04em] tabular-nums"
          >
            000
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-0 px-[2vw] pb-[2.4vw] max-md:px-[7%] max-md:pb-8">
          <div className="overflow-hidden">
            <p
              ref={statusRef}
              data-in
              className="text16 font-mono uppercase tracking-[0.04em]"
            >
              Initializing
            </p>
          </div>
        </div>
      </div>

      <div
        ref={barRef}
        className="absolute inset-x-0 bottom-0 z-10 h-[1vw] max-md:h-1 bg-secondary/10"
      >
        <div
          ref={fillRef}
          className="h-full w-full origin-left bg-primary"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
    </div>
  );
}
