"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ButtonComponent from "../Resuable/ButtonComponent";
import { VSLogo, Wordmark } from "./LogoMarks";
import ScrambleText, { useScramble } from "../Resuable/ScrambleText";
import { useLoader } from "../Loader/LoaderContext";
import MobileNavbar, { MobileMenuToggle } from "./MobileNavbar";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const links = [
  { label: "ABOUT", href: "#about" },
  { label: "THE GAP", href: "#the-gap" },
  { label: "SERVICE", href: "#service" },
  { label: "PROCESS", href: "#process" },
  { label: "WORK", href: "#work" },
];

const THEMES = {
  light: { ink: "#FFFFFF" },
  dark: { ink: "#000000" },
};

const INK_SECTIONS = [
  { section: "#hero", theme: "light" },
  { section: "#hero", theme: "dark", progress: 0.34 },
  { section: "#the-gap", theme: "light", offset: "-12vw" },
  {
    section: "#Take-all-of-it",
    theme: "dark",
    anchor: "#the-gap",
    edge: "bottom",
    offset: "-16vw",
  },
  { section: "#comparision", theme: "dark" },
  { section: "#before-after", theme: "dark" },
  { section: "#process", theme: "dark" },
  { section: "#work", theme: "light", offset: "-25vw" },
  { section: "#section-break", theme: "dark", offset: "6.5vw" },
  { section: "#contact", theme: "dark" },
  { section: "#footer", theme: "dark" },
];

const DURATION = 0.45;
const EASE = "power2.out";
const LINE_OFFSET = 0;
const HIDE_AFTER = 100;

function toPx(value) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;

  const amount = parseFloat(value);
  if (Number.isNaN(amount)) return 0;
  if (value.endsWith("vw")) return (amount / 100) * window.innerWidth;
  if (value.endsWith("vh")) return (amount / 100) * window.innerHeight;
  return amount;
}

function NavLink({ href, label }) {
  const { run, handlers } = useScramble();
  return (
    <Link
      href={href}
      {...handlers}
      className="text16 font-pp uppercase leading-none tracking-[0.04em]"
    >
      <ScrambleText text={label} run={run} />
    </Link>
  );
}

export default function Navbar() {
  const { revealed: siteReady } = useLoader();
  const [revealed, setRevealed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null); 

  useEffect(() => {
    if (!siteReady) return;
    const timer = window.setTimeout(() => setRevealed(true), 120);
    return () => window.clearTimeout(timer);
  }, [siteReady]);

  useGSAP(
    () => {
      const header = headerRef.current;
      if (!header) return;

      gsap.set(header, { "--nav-ink": THEMES.light.ink });

      const collect = () =>
        INK_SECTIONS.map((entry) => {
          const el = document.querySelector(entry.section);
          return {
            ...entry,
            el,
            anchorEl: (entry.anchor && document.querySelector(entry.anchor)) || el,
          };
        }).filter((entry) => entry.el);

      let present = [];
      let marks = [];
      let current = null;
      let armed = false;

      const measure = () => {
        present = collect();
        const scroll = window.scrollY;
        const line = header.offsetHeight - LINE_OFFSET;

        const points = present.slice(1).map((entry) => {
          const rect = entry.anchorEl.getBoundingClientRect();
          const edge = entry.edge === "bottom" ? rect.bottom : rect.top;
          const progress =
            typeof entry.progress === "number"
              ? entry.progress *
                Math.max(0, entry.el.offsetHeight - window.innerHeight)
              : 0;

          return {
            theme: entry.theme,
            at: edge + scroll - line + toPx(entry.offset) + progress,
          };
        });

        points.sort((a, b) => a.at - b.at);

        marks = points.map((point) => ({
          at: point.at,
          ink: THEMES[point.theme].ink,
        }));
      };

      const paint = (scroll) => {
        const base = THEMES[present[0]?.theme || "light"].ink;
        let ink = base;

        for (const mark of marks) {
          if (scroll < mark.at) break;
          ink = mark.ink;
        }

        if (ink === current) return;

        if (current === null) {
          gsap.set(header, { "--nav-ink": ink });
        } else {
          gsap.to(header, {
            "--nav-ink": ink,
            duration: DURATION,
            ease: EASE,
            overwrite: true,
          });
        }

        current = ink;
      };

      const arm = () => {
        present = collect();
        if (!present.length) {
          gsap.delayedCall(0.05, arm);
          return;
        }
        if (armed) {
          measure();
          paint(window.scrollY);
          return;
        }
        armed = true;

        // html is `h-full` (one viewport), so triggering on documentElement
        // gave this pin a zero-length range — onUpdate never ran.
        ScrollTrigger.create({
          start: 0,
          end: "max",
          invalidateOnRefresh: true,
          onRefresh: () => {
            measure();
            paint(window.scrollY);
          },
          onUpdate: (self) => {
            const scroll = self.scroll();
            paint(scroll);
            setHidden(self.direction === 1 && scroll > HIDE_AFTER);
          },
        });

        measure();
        paint(window.scrollY);
      };

      arm();
    },
    { dependencies: [siteReady], revertOnUpdate: true },
  );

  return (
    <>
      <header
        ref={headerRef}
        style={{ color: "var(--nav-ink, #FFFFFF)" }}
        className={`fixed inset-x-0 top-0 z-500 transition-transform duration-700 ease-out ${
          !revealed || (hidden && !menuOpen)
            ? "-translate-y-full"
            : "translate-y-0"
        }`}
      >
        <div className="relative flex items-center justify-between px-[2vw] py-[1.2vw] max-md:px-[7%] max-md:py-5">
          <Link href="/" className="flex items-center gap-[0.7vw]">
            <VSLogo className="h-8 w-auto" />
            <Wordmark className="h-4.5 w-auto" />
          </Link>

          <nav className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-[1.6vw] max-md:hidden">
            {links.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>

          <div className="flex items-center gap-[1.4vw] max-md:hidden">
            <div className="flex items-center gap-[0.45vw]">
              <span className="size-2.5 shrink-0 bg-primary" />
              <p className="text16 font-mono uppercase tracking-[0.04em] opacity-90">
                Available for work
              </p>
            </div>

            <ButtonComponent href="#contact" />
          </div>
          <MobileMenuToggle menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        </div>
      </header>
      <MobileNavbar links={links} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    </>
  );
}
