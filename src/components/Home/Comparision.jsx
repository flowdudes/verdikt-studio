"use client";

import React, { useMemo, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SplitLineReveal from "../Animations/SplitLineReveal";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const STRIPS = 12;
// How wide a strip sits before it grows.
const MIN_SCALE = 0;

const YES = [
  "You built it yourself with AI and it is already live.",
  "You have hit the ceiling of what the tool can do.",
  "You care how it looks and cannot fix it yourself.",
  "You want to own and edit it properly afterwards.",
];

const NO = [
  "You want the cheapest option available.",
  "You want it live by Friday.",
  "You want to keep prompting it afterwards.",
  "You are still deciding what the business is.",
];

// Eyebrow number, eyebrow label, heading, then one per point.
const PER_SIDE = 3 + YES.length;

// Timeline positions, in the master timeline's own seconds. The image opens
// first, the panels fill behind it, and only then does the copy arrive.
const IMAGE = 0;
const STRIPS_AT = .9;
const IN = 2.9;
const STEP = 0.08;

function Panel({
  side,
  num,
  label,
  heading,
  points,
  stripClass,
  numClass,
  ruleClass,
  className,
  handles,
}) {
  const [numHandle, labelHandle, headingHandle, ...pointHandles] = handles;

  return (
    <div
      data-panel={side}
      className="relative h-full flex-1 max-md:h-[80vh] max-md:w-full max-md:flex-none"
    >
      <div className="absolute inset-0 flex">
        {Array.from({ length: STRIPS }).map((_, i) => (
          <div key={i} className="h-full flex-1">
            <div data-strip={side} className={`h-full w-full ${stripClass}`} />
          </div>
        ))}
      </div>

      <div
        className={`relative z-10 flex h-full flex-col px-[2vw] py-[3vw] max-md:px-[7%] max-md:py-[14vw] ${className}`}
      >
        <div className="font-mono text16 uppercase">
          <SplitLineReveal ref={numHandle} as="p" className={numClass}>
            {num}
          </SplitLineReveal>
          <SplitLineReveal ref={labelHandle} as="p">
            {label}
          </SplitLineReveal>
        </div>

        <SplitLineReveal
          ref={headingHandle}
          as="h2"
          className="text120 font-pp leading-[1.1]! font-medium"
          wrapperClassName="mt-[3vw] max-md:mt-[6vw]"
        >
          {heading}
        </SplitLineReveal>

        <div className="mt-auto w-[26vw] max-md:mt-[10vw] max-md:w-full">
          {points.map((point, i) => (
            <div key={point} className="relative py-[1.1vw] max-md:py-[4vw]">
              <SplitLineReveal ref={pointHandles[i]} as="p" className="text20">
                {point}
              </SplitLineReveal>
              {/* Underline is a span so it can scale alongside the reveal */}
              <span
                data-underline
                aria-hidden="true"
                className={`pointer-events-none absolute inset-x-0 bottom-0 h-px ${ruleClass}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Comparision() {
  const sectionRef = useRef(null);
  const frameRef = useRef(null);
  // SplitLineReveal handles — the master timeline scrubs these itself. Plain
  // ref objects rather than a ref of an array, so nothing reads a ref during
  // render when they are handed to the panels.
  const revealRefs = useMemo(
    () => Array.from({ length: PER_SIDE * 2 }, () => ({ current: null })),
    []
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      const left = gsap.utils.toArray('[data-strip="left"]');
      const right = gsap.utils.toArray('[data-strip="right"]');
      const rules = gsap.utils.toArray("[data-underline]");

      // Desktop — the pinned, three-column choreography. Unchanged.
      mm.add("(min-width: 1025.02px)", () => {
        gsap.set(left, { scaleX: MIN_SCALE, transformOrigin: "right center" });
        gsap.set(right, { scaleX: MIN_SCALE, transformOrigin: "left center" });
        gsap.set(rules, { scaleX: 0, transformOrigin: "left center" });
        gsap.set(frameRef.current, {
          scale: 0.7,
          yPercent: 0,
          transformOrigin: "center center",
        });

        const tl = gsap.timeline({
          defaults: { ease: "none", duration: 1 },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "-20% top",
            end: "bottom bottom",
            scrub: true,
            markers: false,
            invalidateOnRefresh: true,
          },
        });

        // 1 — the image rises into place, scaling up from its own centre.
        // Transforms leave the layout alone, so the column holds its slot while
        // the image grows into it.
        tl.to(
          frameRef.current,
          { scale: 1, yPercent: 0, transformOrigin: 'center', duration: 1 },
          IMAGE
        );

        // 2 — both panels fill outward from the image in the middle.
        tl.to(
          left,
          { scaleX: 1, stagger: { amount: 0.7, from: "end" } },
          STRIPS_AT
        ).to(
          right,
          { scaleX: 1, stagger: { amount: 0.7, from: "start" } },
          STRIPS_AT
        );

        // 3 — copy climbs out from behind its masks once the panels are solid.
        // Both sides share a slot so they cascade together instead of one panel
        // waiting on the other. Nothing exits — this is the resting state.
        revealRefs.forEach((reveal, i) => {
          const slot = i % PER_SIDE;
          const copy = { p: 0 };
          const draw = () => reveal.current?.setProgress(copy.p);

          tl.to(copy, { p: 1, duration: 0.7, onUpdate: draw }, IN + slot * STEP);
        });

        rules.forEach((rule, i) => {
          const slot = i % YES.length;
          tl.to(rule, { scaleX: 1, duration: 0.7 }, IN + (slot + 3) * STEP);
        });
      });

      // Mobile — nothing is pinned, so each block plays as it scrolls past.
      // The strips wipe up the stacked panel rather than out from a centre
      // column that is no longer beside them.
      mm.add("(max-width: 1025px)", () => {
        gsap.set(frameRef.current, { scale: 1, yPercent: 0, clearProps: "transform" });

        [
          { strips: left, panel: 0, side: "left" },
          { strips: right, panel: 1, side: "right" },
        ].forEach(({ strips, panel, side }) => {
          const scope = sectionRef.current?.querySelector(
            `[data-panel="${side}"]`
          );
          if (!scope) return;

          gsap.set(strips, { scaleY: MIN_SCALE, transformOrigin: "bottom center" });

          const tl = gsap.timeline({
            defaults: { ease: "none", duration: 1 },
            scrollTrigger: {
              trigger: scope,
              // Late on purpose. The panel is a tall stacked block, so its top
              // edge clears the fold long before the panel reads as on-screen —
              // anchoring the start to `center` waits for the body of it, and
              // the wipe then runs across the last stretch of its own height.
              start: "center 85%",
              end: "bottom 60%",
              scrub: true,
              invalidateOnRefresh: true,
            },
          });

          // A tight stagger: enough to read as a wipe travelling across the
          // panel, small enough that the strip tops do not form a visible
          // staircase part-way through the scrub.
          tl.to(strips, { scaleY: 1, stagger: { amount: 0.18, from: "start" } }, 0);

          const handles = revealRefs.slice(
            panel * PER_SIDE,
            (panel + 1) * PER_SIDE
          );

          handles.forEach((reveal, i) => {
            const copy = { p: 0 };
            const draw = () => reveal.current?.setProgress(copy.p);

            tl.to(copy, { p: 1, duration: 0.7, onUpdate: draw }, 0.6 + i * STEP);
          });

          const panelRules = rules.slice(
            panel * YES.length,
            (panel + 1) * YES.length
          );

          gsap.set(panelRules, { scaleX: 0, transformOrigin: "left center" });

          panelRules.forEach((rule, i) => {
            tl.to(rule, { scaleX: 1, duration: 0.7 }, 0.6 + (i + 3) * STEP);
          });
        });
      });
    },
    { scope: sectionRef, dependencies: [revealRefs] }
  );

  return (
    <section
      id="comparision"
      ref={sectionRef}
      className="relative mt-[5vw] h-[400vh] w-full max-md:mt-[14vw] max-md:h-auto"
    >
      <div className="sticky top-0 flex items-center justify-center h-screen w-full overflow-hidden bg-white max-md:static max-md:h-auto max-md:flex-col">
        <Panel
          side="left"
          num="005"
          label="The Fit/Yes"
          heading={
            <>
              This is <br /> for you.
            </>
          }
          points={YES}
          stripClass="bg-primary"
          numClass="text-secondary"
          ruleClass="bg-background/30"
          className="text-background"
          handles={revealRefs.slice(0, PER_SIDE)}
        />

        <div
          ref={frameRef}
          className="h-full w-[31vw] shrink-0 overflow-hidden max-md:order-first max-md:h-[70vh] max-md:w-full"
        >
          <Image
            src={"/imgs/foru.png"}
            alt="Comparision"
            width={1000}
            height={1000}
            className="h-full w-full object-cover"
          />
        </div>

        <Panel
          side="right"
          num="005"
          label="The Fit/No"
          heading={
            <>
              Not for <br /> you.
            </>
          }
          points={NO}
          stripClass="bg-[#FFEEF6]"
          numClass="text-primary"
          ruleClass="bg-secondary/15"
          className="text-secondary"
          handles={revealRefs.slice(PER_SIDE)}
        />
      </div>
    </section>
  );
}
