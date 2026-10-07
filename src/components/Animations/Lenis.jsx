"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";

// Reloading halfway down a scrubbed page paints the whole hero in its start
// state for a frame before ScrollTrigger catches up. Refusing the browser's
// scroll restoration keeps a reload at the top, where that state is correct.
if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const LenisSmoothScroll = ({
  duration = 1.25,
  lerp = 0.075,
  smoothWheel = true,
  wheelMultiplier = 0.8,
  touchMultiplier = .8,
}) => {
  const lenisRef = useRef(null);

  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);

    // Safari still restores after load even with scrollRestoration manual.
    window.scrollTo(0, 0);
    lenisRef.current?.lenis?.scrollTo(0, { immediate: true, force: true });

    // Lenis reports the smoothed position it is about to paint. Without this
    // ScrollTrigger reads the raw scroll instead and every scrub lags it.
    const lenis = lenisRef.current?.lenis;
    lenis?.on("scroll", ScrollTrigger.update);

    return () => {
      gsap.ticker.remove(update);
      lenis?.off("scroll", ScrollTrigger.update);
    };
  }, []);

  return (
    <ReactLenis
      root
      options={{
        autoRaf: false,
        duration: duration,
        syncTouch: true,
        allowNestedScroll: true,
        lerp: lerp,
        smoothWheel: smoothWheel,
        wheelMultiplier: wheelMultiplier,
        touchMultiplier: touchMultiplier,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      }}
      ref={lenisRef}
    />
  );
};

export default LenisSmoothScroll;