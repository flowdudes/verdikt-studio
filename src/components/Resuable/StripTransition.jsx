"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { STRIP_COUNT } from "@/utils/logoMorph";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function StripTransition({
  color = "bg-secondary",
  className = "mt-[-60vw] max-md:mt-[-60vh]",
  start = "top 5%",
  end = "bottom bottom",
  markers = false,
}) {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      const strips = gsap.utils.toArray("[data-strip]");

      gsap.set(strips, { yPercent: 100 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start,
          end,
          scrub: true,
          invalidateOnRefresh: true,
          markers,
        },
      });

      const fromEdges = { amount: 0.55, from: "edges" };

      tl.to(strips, {
        yPercent: 0,
        stagger: fromEdges,
        duration: 1,
      }).to(strips, {
        yPercent: -100,
        stagger: fromEdges,
        duration: 1,
      });
    },
    { scope: sectionRef, dependencies: [start, end, markers] }
  );

  return (
    <section
      ref={sectionRef}
      aria-hidden="true"
      className={`pointer-events-none relative h-[250vh] w-full ${className}`}
    >
      <div className="sticky top-0 h-screen w-full  overflow-hidden">
        <div className="absolute inset-0 flex">
          {Array.from({ length: STRIP_COUNT }).map((_, i) => (
            <div
              key={i}
              data-strip
              className={`h-full w-full shrink-0 ${color}`}
              style={{ flexBasis: `${100 / STRIP_COUNT}%` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
