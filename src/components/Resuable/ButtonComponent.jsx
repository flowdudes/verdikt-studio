"use client";

import Link from "next/link";
import React from "react";
import ScrambleText, { useScramble } from "./ScrambleText";

function Arrow({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`size-4 ${className}`}
    >
      <path
        d="M13 5H19V11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 5L5 19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ButtonComponent({
  text = "Send me your site",
  href,
  type = "button",
  className = "",
  ...props
}) {
  const { run, handlers } = useScramble();

  const classes = [
    "text20 group cursor-pointer flex shrink-0 items-center justify-between gap-[.8vw] bg-primary px-[1.1vw] py-[.8vw] max-md:py-4 max-md:px-6 font-sans capatilize  text-background ",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <ScrambleText text={text} run={run} />
      <span className="relative block size-4 overflow-hidden">
        <Arrow className="absolute inset-0 transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:translate-x-[160%] group-hover:translate-y-[-160%]" />
        <Arrow className="absolute inset-0 translate-x-[-160%] translate-y-[160%] transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:translate-x-0 group-hover:translate-y-0" />
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} {...handlers} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} {...handlers} className={classes} {...props}>
      {content}
    </button>
  );
}
