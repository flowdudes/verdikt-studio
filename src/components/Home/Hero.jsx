"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import HeroContactForm from "./HeroContactForm";
import HeroBackdrop from "./HeroBackdrop";
import SplitLineReveal from "../Animations/SplitLineReveal";
import { useLoader } from "../Loader/LoaderContext";
import { boxGeometry, morphClipPath } from "@/utils/logoMorph";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const DASH = "rgba(173, 0, 82, 0.4)";
const dashes = (direction) =>
  `repeating-linear-gradient(${direction}, ${DASH} 0 4px, transparent 4px 10px)`;

export default function Hero() {
  // The loader owns the cube until it has grown into this section's backdrop,
  // so the copy waits on it rather than on a timer of its own.
  const { revealed, holdEntry } = useLoader();
  const introRef = useRef(null);
  // Releases the scroll lock. Owned by the intro, called from wherever that
  // sequence actually ends — its own completion, a reduced-motion skip, or the
  // section unmounting — so the page can never be left unable to scroll.
  const releaseRef = useRef(null);

  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const formRef = useRef(null);
  const formIntroRef = useRef(null);
  const gridRef = useRef(null);
  // The headline + form block, measured so the mobile caption can clear it.
  const copyBlockRef = useRef(null);
  // SplitLineReveal handles — the master timeline scrubs these itself.
  const headingRef = useRef(null);
  const leadRef = useRef(null);
  const wordmarkRef = useRef(null);
  const wordmarkCopyRef = useRef(null);

  useGSAP(
    () => {
      const stage = stageRef.current;
      const grid = gridRef.current;
      const lines = [...grid.querySelectorAll("[data-line]")];

      const state = { box: 0, lines: 0, morph: 0 };
      let geo = null;

      const drawShape = () => {
        if (!geo) return;
        stage.style.clipPath = morphClipPath(geo, state.box, state.morph);
      };

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
        drawShape();
        drawLines();
      };

      const layout = () => {
        // The mobile caption sits directly above the headline/form block, whose
        // height depends on how the headline wraps. Publish that height so the
        // offset is measured rather than guessed at in the markup.
        const block = copyBlockRef.current;
        if (block) {
          const gap = parseFloat(getComputedStyle(block).rowGap) || 0;
          sectionRef.current.style.setProperty(
            "--hero-copy-clear",
            `${block.offsetHeight + gap}px`
          );
        }

        const rect = stage.getBoundingClientRect();
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
      ScrollTrigger.addEventListener("refresh", layout);

      // Hero copy plays once on load, then the scroll timeline runs the same
      // reveal backwards — the lines drop back behind their masks rather than
      // the whole block fading out.
      //
      // Two values, not one. The intro raises `in`, the scroll timeline lowers
      // `out`, and the copy shows the lower of the two. A single shared
      // progress let whichever rendered last win: a scrubbed timeline renders
      // its first tween as it settles, before anyone has scrolled, which put
      // the headline on screen while the loader still had the intro paused.
      const copy = { in: 0, out: 1 };
      const drawCopy = () => {
        const p = Math.min(copy.in, copy.out);
        headingRef.current?.setProgress(p);
        leadRef.current?.setProgress(p);
      };

      // Seeds both reveals at 0 now rather than leaving them wherever their own
      // setup left them, so a re-split (font swap, resize) restores hidden.
      drawCopy();

      // Built paused and played by the loader handover below, so nothing runs
      // while the white overlay is still up. The form's `fromTo` renders its
      // start state on creation, which is what parks it off-screen until then.
      //
      // The page enters top to bottom: the navbar drops first (Navbar starts
      // itself off the same loader flag), then the copy, then the form. The
      // offsets here are what leaves room for the bar to be clearly on its way
      // down before anything below it moves.
      //
      // 200 rather than 140 on the form: it sits 3vw off the bottom, so a
      // shorter push leaves a sliver of it showing under the edge.

      // The page is not "in" until this has played out, and it must not scroll
      // before then: the scroll timeline below drives the same copy backwards,
      // so a wheel event landing mid-intro would pull the headline out while it
      // is still arriving. Claimed here rather than at reveal so the hold is
      // already standing when the loader hands over.
      const release = holdEntry();
      releaseRef.current = release;

      const intro = gsap
        .timeline({ paused: true, onComplete: release })
        .to(copy, { in: 1, duration: 1.05, ease: "none", onUpdate: drawCopy }, 0.45)
        .fromTo(
          formIntroRef.current,
          { yPercent: 200 },
          { yPercent: 0, duration: 0.95, ease: "power3.out" },
          0.95
        );
      introRef.current = intro;

      // GSAP owns the wordmark transform from here on, so the markup can ship
      // it merely hidden and this is the only thing writing a transform to it.
      gsap.set(wordmarkRef.current, { yPercent: 115, visibility: "visible" });

      // Wordmark caption, revealed the same way once the square has landed.
      const outro = { p: 0 };
      const drawOutro = () => wordmarkCopyRef.current?.setProgress(outro.p);

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        onUpdate: draw,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      tl
        .to(formRef.current, { yPercent: 160, duration: 0.12, ease: "power2.in" }, 0)
        .fromTo(
          copy,
          { out: 1 },
          {
            out: 0,
            duration: 0.14,
            immediateRender: false,
            onUpdate: () => {
              // Scrolling mid-intro hands the intro to its end rather than
              // letting it keep playing underneath. Gated on the intro actually
              // running: an onStart callback fires the first time this renders
              // past 0, which ScrollTrigger does while it settles, and that
              // would finish the intro before the loader had ever played it.
              if (intro.isActive()) {
                intro.progress(1);
                // Seeking skips the timeline's onComplete, so the hold it took
                // out has to be handed back here as well.
                release();
              }
              drawCopy();
            },
          },
          "<"
        )
        .to(state, { box: 1, duration: 0.3, ease: "power2.inOut" }, 0.28)
        .to(state, { lines: 1, duration: 0.22 }, 0.4)
        // Both wait for the square to finish shrinking at 0.58 — revealed any
        // earlier they come up dark-on-dark over the gradient.
        // fromTo, so `invalidateOnRefresh` cannot re-record the start value as
        // wherever the wordmark happens to sit when a refresh lands.
        .fromTo(
          wordmarkRef.current,
          { yPercent: 115 },
          { yPercent: 0, duration: 0.1, ease: "power3.out", immediateRender: false },
          0.58
        )
        .to(outro, { p: 1, duration: 0.12, onUpdate: drawOutro }, 0.61)
        .to(state, { morph: 1, duration: 0.12 }, 0.62)
        .to(state, { morph: 2, duration: 0.13 }, 0.74)
        .to(state, { morph: 3, duration: 0.11 }, 0.87)
        .to({}, { duration: 0.04 }, 0.98);

      return () => {
        release();
        ScrollTrigger.removeEventListener("refresh", layout);
      };
    },
    { scope: sectionRef }
  );

  // useGSAP runs in a layout effect, so the timeline is always on the ref by
  // the time this fires.
  useEffect(() => {
    if (!revealed) return;
    const intro = introRef.current;

    // A scroll that beat the loader will already have run this to its end.
    // `play()` on a finished timeline rewinds and replays it, which reads as
    // the copy snapping away before it animates back in. Nothing is left to
    // wait for either way, so let the page go.
    if (!intro || intro.progress() > 0) {
      releaseRef.current?.();
      return;
    }

    // The loader skips itself under reduced motion, so land the hero in its
    // finished state rather than sliding the form up into an already-still page.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Seeking does not fire the timeline's onComplete, so the lock has to be
      // lifted by hand here.
      intro.progress(1);
      releaseRef.current?.();
    } else {
      intro.play();
    }
  }, [revealed]);

  return (
    <section id="hero" ref={sectionRef} className="h-[250vh] w-full relative">

      <div className="sticky top-0 isolate bg-white h-dvh w-full overflow-hidden">

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

        <div className="pointer-events-none  absolute inset-0 z-5 text-secondary">
          <div className="absolute left-[2vw] top-[5vw] overflow-hidden max-md:left-[7%] max-md:top-[22vw]">
            {/* Hidden rather than pre-transformed: GSAP reads a foreign
                inline transform back as pixels and would stack its own
                yPercent on top of it. */}
            <div ref={wordmarkRef} style={{ visibility: "hidden" }}>
              <Image
                src="/svgs/wordmark.svg"
                alt="verdikt.studio"
                width={179}
                height={23}
                priority
                unoptimized
                className="h-auto opacity-0 w-[28vw] max-md:w-[52vw]"
              />
            </div>
          </div>

          <SplitLineReveal
            ref={wordmarkCopyRef}
            as="p"
            className="text28"
            wrapperClassName="absolute text-[#0A0A0A] bottom-[2.6vw] right-[2vw] w-[35vw] max-md:inset-x-[7%] font-inter max-md:bottom-20 max-md:w-auto"
          >
           A small studio that turns AI-built websites into proper Webflow sites, with motion that makes them feel like something a real company shipped.
          </SplitLineReveal>
        </div>

        <div
          ref={copyBlockRef}
          className="absolute flex-col gap-[2vw] inset-x-0 bottom-[3vw] flex justify-center px-[2vw] z-10 max-md:bottom-[8vw] max-md:gap-[7vw] max-md:px-[7%]"
        >
          <div className="min-h-20 w-full text-background  flex items-end justify-between max-md:min-h-0 max-md:flex-col max-md:items-start max-md:gap-[5vw]">
            <SplitLineReveal
              ref={headingRef}
              as="h1"
              className="text72"
              wrapperClassName="w-[40vw] max-md:w-full font-pp text-[#DCDCDC]"
            >
              You built it with AI. <br /> It works. It just sits there.
            </SplitLineReveal>
            <SplitLineReveal
              ref={leadRef}
              as="p"
              className="text20"
              wrapperClassName="max-w-[18vw] max-md:max-w-full text-[#DCDCDC]"
            >
              We rebuild AI-built sites in Webflow with motion that makes them
              feel real. Take the whole thing, or just the part you need.
            </SplitLineReveal>
          </div>
          {/* Two wrappers, two owners: the scroll timeline pushes the outer
              one away, the intro brings the inner one in. Sharing one element
              means whichever renders last wins the transform. */}
          <div ref={formRef} className="w-full">
            <div ref={formIntroRef} className="w-full">
              <HeroContactForm />
            </div>
          </div>
        </div>
      </div>

    </section>

  );
}
