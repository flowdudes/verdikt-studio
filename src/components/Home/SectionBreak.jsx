"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ITEMS = [
  "Webflow Premium Partner",
  "Webflow Global Leader",
  "Awwwards Site Honor",
  "Working with US and UK studios",
];

const BANDS = [
  { rotate: -5, direction: -1, z: 10 },
  { rotate: 5, direction: 1, z: 20 },
];

function Run({ items, measure = false }) {
  return (
    <div {...(measure ? { "data-band-run": "" } : {})} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <div key={i} className="flex gap-10 pl-10 shrink-0 items-center">
          <span className="text-[1.7vw] text-[#15000B] font-pp font-medium whitespace-nowrap px-[2vw] max-md:text-base">
            {item}
          </span>
     
          <span className="size-[1.3vw]  shrink-0 bg-[#15000B] max-md:size-2" />
        </div>
      ))}
    </div>
  );
}

export default function SectionBreak({ items = ITEMS, className = "" }) {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      const tracks = gsap.utils.toArray("[data-band-track]");
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const tweens = tracks.map((track) => {
        const run = track.querySelector("[data-band-run]");
        const distance = run.offsetWidth;
        const direction = Number(track.dataset.direction);
        const from = direction > 0 ? -distance : 0;

        gsap.set(track, { x: from });

        return gsap.fromTo(
          track,
          { x: from },
          {
            x: from + direction * distance,
            duration: distance / 45,
            ease: "none",
            repeat: -1,
            paused: prefersReducedMotion,
          }
        );
      });

      if (prefersReducedMotion) return;

      const boostSetters = tweens.map((tween) =>
        gsap.quickTo(tween, "timeScale", { duration: 0.15, ease: "power2.out" })
      );
      const restSetters = tweens.map((tween) =>
        gsap.quickTo(tween, "timeScale", { duration: 0.8, ease: "none" })
      );

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const velocity = Math.abs(self.getVelocity());
          const scrolling = velocity > 20;
          const boost = scrolling ? 1 + Math.min(velocity / 150, 25) : 1;
          const setters = scrolling ? boostSetters : restSetters;

          setters.forEach((set) => set(boost));
        },
      });
    },
    { scope: sectionRef, dependencies: [items] }
  );

  return (
    <section
      id="section-break"
      aria-hidden="true"
      ref={sectionRef}
      className={`relative w-full overflow-hidden bg-background py-[6vw] max-md:py-16 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-10%] top-1/2 h-[60vw] max-md:h-[80vh] w-[120%] bg-secondary"
        style={{
          transform: "translateY(calc(-100% - 3.075vw))",
          rotate: `${BANDS[0].rotate}deg`,
        }}
      />
      {BANDS.map((band, index) => (
        <div
          key={index}
          className="absolute left-[-10%] top-1/2 w-[120%] -translate-y-1/2 overflow-hidden border-y border-secondary/25 bg-background py-[3.5vw] text-secondary max-md:py-5"
          style={{ rotate: `${band.rotate}deg`, zIndex: band.z }}
        >
          <div
            data-band-track
            data-direction={band.direction}
            className="flex w-max items-center will-change-transform"
          >
            <Run items={items} measure />
            <Run items={items} />
          </div>
        </div>
      ))}

      <div className="h-[18vw] w-full max-md:h-44" />
    </section>
  );
}
