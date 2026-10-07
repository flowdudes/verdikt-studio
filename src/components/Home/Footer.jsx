"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ButtonComponent from "../Resuable/ButtonComponent";
import ScrambleText, { useScramble } from "../Resuable/ScrambleText";
import { FadeUp, LineReveal } from "../Animations/gsapAnim";
import HeroBackdrop from "./HeroBackdrop";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const LOGO_MASK = {
  WebkitMaskImage: "url(/svgs/footer-logo.svg)",
  maskImage: "url(/svgs/footer-logo.svg)",
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  maskMode: "alpha",
};

const LINKS = [
  { label: "Cookies", href: "/" },
  { label: "Privacy Policy", href: "/" },
  { label: "Instagram", href: "https://instagram.com/verdikt.studio" },
  { label: "Facebook", href: "https://facebook.com/verdikt.studio" },
];

const COPYRIGHT = "© 2026 Verdikt Studio. A Flowdudes company";

function FooterLink({ href, label }) {
  const { run, handlers } = useScramble();
  const external = href.startsWith("http");

  return (
    <Link
      href={href}
      {...handlers}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="text-[0.75vw] text-foreground max-md:text-sm"
    >
      <ScrambleText text={label} run={run} />
    </Link>
  );
}

export default function Footer() {
  const footerRef = useRef(null);
  const logoRef = useRef(null);

  useGSAP(
    () => {
      const logo = logoRef.current;
      if (!logo) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      gsap.fromTo(
        logo,
        { yPercent: 25, scale: 0.85 },
        {
          yPercent: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 90%",
            end: "bottom bottom",
            scrub: true,
          },
        },
      );
    },
    { scope: footerRef },
  );

  return (
    <footer
      ref={footerRef}
      id="footer"
      className="relative w-full overflow-hidden bg-background pt-[2vh] max-md:pt-16"
    >
      <div className="relative px-[2vw] max-md:px-0 flex items-start max-md:flex-col max-md:gap-8">
        <div className="flex items-center w-[50%] gap-[0.45vw] max-md:w-full max-md:gap-2 max-md:px-4">
          <span className="size-2.5 shrink-0 bg-primary max-md:size-2" />
          <p className="text16 font-mono uppercase tracking-[0.04em] text-foreground max-md:text-[10px]">
            Available for work
          </p>
        </div>

        <div className="mt-[-1.4vw] w-[50%] flex flex-col items-start gap-[1.8vw] max-md:mt-0 max-md:w-full max-md:gap-6 max-md:px-4">
          <LineReveal
            as="h2"
            className="text72 text-[#0A0A0A] font-pp text-left font-medium max-md:w-full max-md:text-3xl"
          >
            Your site works.
            <br />
            Let&rsquo;s make it feel real.
          </LineReveal>

          <FadeUp delay={0.15}>
            <ButtonComponent href="#contact" />
          </FadeUp>
        </div>
      </div>

      <FadeUp className="mt-[4vw] flex items-center justify-between px-[2vw] max-md:mt-12 max-md:flex-col max-md:items-start max-md:gap-3 max-md:px-4">
        <p className="text-[0.75vw] text-[#0A0A0A] max-md:text-sm">{COPYRIGHT}</p>

        {LINKS.map((item) => (
          <FooterLink key={item.href} href={item.href} label={item.label} />
        ))}
      </FadeUp>

      <div
        ref={logoRef}
        className="relative w-[95%] mt-[2vw] mx-auto will-change-transform max-md:w-full max-md:mt-10"
      >
        <Image
          src="/svgs/footer-logo.svg"
          alt=""
          aria-hidden="true"
          width={1852}
          height={407}
          unoptimized
          className="block w-full h-auto opacity-0 select-none max-md:mt-8"
        />
        <div className="absolute inset-0 overflow-hidden" style={LOGO_MASK}>
          <HeroBackdrop />
        </div>
      </div>
    </footer>
  );
}
