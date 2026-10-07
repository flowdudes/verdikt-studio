"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const STRIPS = 14;

// Row heights, cycled down the stack. The uneven pattern is what gives the
// cover its mixed-thickness bars — the timing stays an ordered cascade.
const WEIGHTS = [3, 1.4, 2.2, 1, 2.8, 1.6];

/**
 * Horizontal strips that scale open across the section arriving underneath and
 * stay open. Each row grows from its own centre line, so the page shows through
 * the gaps until the cover closes solid.
 *
 * Sits between two sections like StripTransition does. The host is taller than
 * the screen and its inner layer sticks, so the closed cover holds for a beat
 * before scrolling away.
 */
export default function StripScaleReveal({
  color = "bg-secondary",
  count = STRIPS,
  className = "",
  start = "top bottom",
  end = "top top",
  // Order the rows land in — "end" runs bottom to top; also "start",
  // "center" or "edges".
  from = "end",
  markers = false,
}) {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      const strips = gsap.utils.toArray("[data-strip-row]");

      gsap.set(strips, { scaleY: 0, transformOrigin: "center center" });

      const tl = gsap.timeline({
        defaults: { ease: "none", duration: 1 },
        scrollTrigger: {
          trigger: sectionRef.current,
          start,
          end,
          scrub: true,
          invalidateOnRefresh: true,
          markers,
        },
      });

      tl.to(strips, { scaleY: 1, stagger: { amount: 0.65, from } });
    },
    { scope: sectionRef, dependencies: [count, start, end, from, markers] }
  );

  return (
    <section
      ref={sectionRef}
      aria-hidden="true"
      className={`pointer-events-none relative z-50 h-[150vh] w-full ${className}`}
    >
      <div className="sticky top-0 flex h-screen w-full flex-col overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="w-full"
            style={{ flex: `${WEIGHTS[i % WEIGHTS.length]} 1 0%` }}
          >
            <div data-strip-row className={`h-full w-full ${color}`} />
          </div>
        ))}
      </div>
    </section>
  );
}
