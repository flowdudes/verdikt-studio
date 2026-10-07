'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { LineReveal } from '@/components/Animations/gsapAnim';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const STEPS = [
  {
    title: 'Send the link',
    body: 'Share your website, email, and a short note about what feels wrong.',
  },
  {
    title: 'Get the verdict',
    body: 'A clear read on what is holding the site back and what it takes to fix.',
  },
  {
    title: 'We build it',
    body: 'We handle the Webflow conversion, motion layer, or complete rebuild.',
  },
  {
    title: 'You launch',
    body: 'Your finished site is handed over clean, responsive, and ready to edit.',
  },
];

/**
 * The Process — section label top-left, an oversized statement whose first line
 * is indented before the rest runs to the left edge, and a 2x2 step grid held
 * to the right half so the lower-left stays open.
 */
export default function Process() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      const steps = gsap.utils.toArray('[data-step]');

      gsap.set(steps, { autoAlpha: 0, y: 32 });

      gsap.to(steps, {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.14,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: '20% 70%',
          once: true,
          markers:false,
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id='process'
      className='relative z-10 flex h-screen w-full flex-col bg-background px-[2vw] py-[4vw] text-foreground max-md:h-auto max-md:px-[7%] max-md:py-[16vw]'
    >
      <div className='font-mono text16 uppercase'>
        <p className='text-primary'>007</p>
        <p>The Process</p>
      </div>

      {/* The width is what sets the four line breaks; the indent insets only
          the first line, so the block reads as one paragraph, not a heading
          plus a stray line. */}
      {/* SplitText re-wraps every line in its own block, so `text-indent`
          would inset all four. An inline spacer indents only the first line's
          content and travels with it through the split. */}
      <LineReveal
        as='h2'
        className='font-pp mt-[1.2vw] w-[62vw] text-[3.3vw] font-medium leading-[1.2]! tracking-[-0.015em] max-md:mt-[6vw] max-md:w-full max-md:text-[8vw]'
      >
        <span
          aria-hidden='true'
          className='inline-block w-[24vw] max-md:hidden'
        />
        A straightforward process, with no agency theatre. Send the site. We
        diagnose, build, and hand it back ready to launch.
      </LineReveal>

      {/* Steps sit in the right half — the open lower-left is deliberate. */}
      <div className='mt-auto flex justify-end max-md:mt-[14vw] max-md:justify-start'>
        <div className='grid w-[50vw] grid-cols-2 gap-x-[2.5vw] gap-y-[6vw] max-md:w-full max-md:grid-cols-1 max-md:gap-y-[10vw]'>
          {STEPS.map((step) => (
            <div
              key={step.title}
              data-step
              className='flex items-start gap-[2vw] max-md:gap-[5vw]'
            >
              <h3 className='text18 text-[#0A0A0A] w-[8vw] shrink-0 font-medium max-md:w-[38%]'>
                {step.title}
              </h3>
              <p className='text18 w-[11vw] leading-[1.2] text-foreground/40 max-md:w-auto max-md:flex-1'>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
