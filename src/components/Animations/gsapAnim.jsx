"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/** Fades children up on first view */
export function FadeUp({
  as: Tag = "div",
  children,
  className = "",
  delay = 0,
  watch,

  rootMargin = "0px 0px -15% 0px",
  ...props
}) {
  const ref = useRef(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    // Adds only the starting offset
    gsap.set(el, { y: 24 });

    // Fixed elements need an external trigger
    const target = (watch && document.querySelector(watch)) || el;

    const play = () => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay,
        ease: "power2.out",
        onComplete: () => {
          el.style.removeProperty("opacity");
          el.classList.remove("opacity-0");
        },
      });
    };

    // Fires once, then disconnects
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        play();
        observer.disconnect();
      },
      { rootMargin },
    );
    observer.observe(target);

    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <Tag ref={ref} className={`opacity-0 ${className}`.trim()} {...props}>
      {children}
    </Tag>
  );
}

export default FadeUp;

/** Reveals copy line by line */
export function LineReveal({
  as: Tag = "div",
  children,
  className = "",
  delay = 0,
  scrub = false,
  top = "top 85%",
  stagger = 0.08,
  duration = 0.85,
  ...props
}) {
  const ref = useRef(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    let split = null;
    let trigger = null;

    // Split after fonts load
    const init = () => {
      if (!ref.current) return;

      split = SplitText.create(el, {
        type: "lines",
        linesClass: "line-wrapper",
        // Lines rise from their own box
        mask: "lines",
      });

      const lines = split.lines;
      if (!lines || lines.length === 0) {
        gsap.set(el, { opacity: 1 });
        return;
      }

      gsap.set(el, { opacity: 1 });
      gsap.set(lines, { yPercent: 150 });

      const to = {
        yPercent: 0,
        duration,
        stagger,
        ease: "power3.out",
      };

      if (scrub) {
        gsap.to(lines, {
          ...to,
          scrollTrigger: {
            trigger: el,
            start: top,
            end: "bottom 60%",
            scrub: scrub === true ? true : scrub,
          },
        });
        return;
      }

      trigger = ScrollTrigger.create({
        trigger: el,
        start: top,
        once: true,
        onEnter: () => gsap.to(lines, { ...to, delay }),
      });
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(init);
    } else {
      init();
    }

    return () => {
      trigger?.kill();
      split?.revert();
    };
  }, []);

  return (
    <Tag ref={ref} className={`opacity-0 ${className}`.trim()} {...props}>
      {children}
    </Tag>
  );
}

/** Draws hairline rules on scroll */
export function lineDraw() {
  /* eslint-disable-next-line react-hooks/rules-of-hooks */
  useGSAP(
    () => {
      const elements = document.querySelectorAll("[data-line-draw]");

      elements.forEach((element) => {
        // Trigger the container, not the line
        const trigger = element.parentElement ?? element;

        gsap.fromTo(
          element,
          { scaleX: 0 },
          {
            scrollTrigger: {
              trigger,
              start: "top 65%",
            },
            scaleX: 1,
            transformOrigin: "left",
            duration: 0.8,
            ease: "power2.out",
          },
        );
      });
    },
    // Empty deps: avoids stacking triggers
    { dependencies: [] },
  );
}
