'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitLineReveal from '../Animations/SplitLineReveal';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const BEFORE_POINTS = [
  'The site works, but feels static and unfinished.',
  'The layout follows predictable tool defaults.',
  'Spacing and hierarchy feel slightly off.',
  'Mobile behaviour breaks in unexpected places.',
  'Every edit risks undoing something else.',
];

const AFTER_POINTS = [
  'Rebuilt properly in Webflow.',
  'Cleaner structure and stronger hierarchy.',
  'Responsive across every screen.',
  'Purposeful motion and interactions.',
  'Easy to manage after launch.',
];

/**
 * Each point is its own masked line reveal, so a point that wraps cascades line
 * by line instead of fading as one block. The reveals are parent-driven:
 * `itemRefs` collects their setProgress handles in list order and the section
 * timeline scrubs them.
 */
function PointList({ points, itemRefs, className = '', ...props }) {
  return (
    <ul {...props} className={className}>
      {points.map((point, index) => (
        <li
          key={point}
          className='flex items-start gap-[0.7vw] py-[0.1vw] max-md:gap-[2.5vw] max-md:py-[1vw]'
        >
          <span
            data-point-dot
            aria-hidden='true'
            className='mt-[0.42vw] size-[0.42vw] shrink-0 bg-foreground/35 max-md:mt-[2vw] max-md:size-[1.6vw]'
          />
          <SplitLineReveal
            as='span'
            ref={(handle) => {
              itemRefs.current[index] = handle;
            }}
            wrapperClassName='min-w-0 flex-1'
            className='text20 block text-foreground/45'
            duration={0.9}
            stagger={0.1}
          >
            {point}
          </SplitLineReveal>
        </li>
      ))}
    </ul>
  );
}

export default function BeforeAfter() {
  const sectionRef = useRef(null);
  const beforeHeadingRef = useRef(null);
  const afterHeadingRef = useRef(null);
  const beforeLeadRef = useRef(null);
  const afterLeadRef = useRef(null);
  const beforeItemRefs = useRef([]);
  const afterItemRefs = useRef([]);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      // Lead paragraph first, then the points — one ordered run of reveals per
      // column, so the stagger reads as a single block of copy writing on.
      const beforeCopy = () => [beforeLeadRef.current, ...beforeItemRefs.current];
      const afterCopy = () => [afterLeadRef.current, ...afterItemRefs.current];

      const driveCopy = (tl, handles, { label, time }, stagger, duration) => {
        handles.forEach((handle, index) => {
          if (!handle) return;

          const offset = time + index * stagger;
          const at = label ? `${label}+=${offset}` : offset;

          tl.to(
            {},
            {
              duration,
              onUpdate() {
                handle.setProgress(this.progress());
              },
            },
            at,
          );
        });
      };

      const measure = () => {
        const stage = sectionRef.current?.querySelector('[data-stage]');
        const slot = sectionRef.current?.querySelector('[data-before-slot]');
        if (!stage || !slot) return { scale: 0.34, x: 0, y: 0 };

        const stageBox = stage.getBoundingClientRect();
        const slotBox = slot.getBoundingClientRect();

        return {
          scale: slotBox.width / stageBox.width,
          // Both boxes are measured untransformed here, so the delta between
          // their centres is the straight translation to the slot.
          x: slotBox.left + slotBox.width / 2 - (stageBox.left + stageBox.width / 2),
          y: slotBox.top + slotBox.height / 2 - (stageBox.top + stageBox.height / 2),
        };
      };

      const mm = gsap.matchMedia();

      // Desktop — the pinned composition: the before frame flies in, holds,
      // then shrinks into the slot as the after frame takes the stage.
      mm.add('(min-width: 1025.02px)', () => {
        let slot = measure();

        gsap.set('[data-before-frame]', { xPercent: 120, scale: 1, x: 0, y: 0 });
        gsap.set('[data-after-frame]', { xPercent: 125, scale: 1.25 });
        gsap.set('[data-point-dot]', {
          scale: 0,
          autoAlpha: 0,
          transformOrigin: 'center',
        });

        if (prefersReducedMotion) {
          gsap.set('[data-before-frame]', { ...slot, xPercent: 0 });
          gsap.set('[data-after-frame]', { xPercent: 0, scale: 1 });
          gsap.set('[data-point-dot]', { scale: 1, autoAlpha: 1 });
          [
            beforeHeadingRef.current,
            afterHeadingRef.current,
            ...beforeCopy(),
            ...afterCopy(),
          ].forEach((handle) => handle?.setProgress(1));
          return;
        }

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: () => `+=${sectionRef.current.offsetHeight - window.innerHeight}`,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });

        // Phase 1 — the "before" frame slides in and its copy writes on behind it.
        tl.to(
          {},
          {
            duration: 1,
            onUpdate() {
              beforeHeadingRef.current?.setProgress(this.progress());
            },
          },
          0,
        ).to('[data-before-frame]', { xPercent: 0, duration: 1.15 }, 0);

        driveCopy(tl, beforeCopy(), { time: 0.4 }, 0.11, 0.5);
        // Dots pop a beat behind their own line, hence the extra stagger step.
        tl.to(
          '[data-before-copy] [data-point-dot]',
          {
            scale: 1,
            autoAlpha: 1,
            duration: 0.3,
            stagger: 0.11,
            ease: 'power2.out',
          },
          0.62,
        );

        // Phase 2 — it holds at full size for a beat, then swaps into the slot.
        tl.to({}, { duration: 0.45 })

          .to(
            '[data-before-frame]',
            {
              duration: 1.2,
              ease: 'power2.inOut',
              scale: () => slot.scale,
              x: () => slot.x,
              y: () => slot.y,
            },
            'swap',
          )
          .to(
            '[data-after-frame]',
            {
              xPercent: 0,
              scale: 1,
              duration: 1.2,
              ease: 'power2.inOut',
            },
            'swap',
          )

          .to(
            {},
            {
              duration: 0.8,
              onUpdate() {
                afterHeadingRef.current?.setProgress(this.progress());
              },
            },
            'swap+=0.55',
          );

        // Same cadence as the before column — 0.11 apart, dots two steps behind.
        driveCopy(tl, afterCopy(), { label: 'swap', time: 0.85 }, 0.11, 0.5);
        tl.to(
          '[data-after-copy] [data-point-dot]',
          {
            scale: 1,
            autoAlpha: 1,
            duration: 0.3,
            stagger: 0.11,
            ease: 'power2.out',
          },
          'swap+=1.07',
        );

        // Tail so the finished composition holds before the section releases.
        tl.to({}, { duration: 0.5 });

        const refresh = () => {
          slot = measure();
        };

        ScrollTrigger.addEventListener('refreshInit', refresh);

        return () => ScrollTrigger.removeEventListener('refreshInit', refresh);
      });

      // Mobile — nothing is pinned and the two frames are stacked blocks, so
      // the fly-into-slot swap has nowhere to fly. Each column just reveals in
      // place as it scrolls past, keeping the copy cadence of the desktop run.
      mm.add('(max-width: 1025px)', () => {
        // Clear the desktop entry transforms: here the frames sit where the
        // document puts them.
        gsap.set('[data-before-frame], [data-after-frame]', {
          clearProps: 'transform',
          xPercent: 0,
          scale: 1,
          x: 0,
          y: 0,
        });
        gsap.set('[data-point-dot]', {
          scale: 0,
          autoAlpha: 0,
          transformOrigin: 'center',
        });

        if (prefersReducedMotion) {
          gsap.set('[data-point-dot]', { scale: 1, autoAlpha: 1 });
          [
            beforeHeadingRef.current,
            afterHeadingRef.current,
            ...beforeCopy(),
            ...afterCopy(),
          ].forEach((handle) => handle?.setProgress(1));
          return;
        }

        [
          {
            scope: '[data-before-copy]',
            heading: beforeHeadingRef,
            copy: beforeCopy(),
          },
          {
            scope: '[data-after-copy]',
            heading: afterHeadingRef,
            copy: afterCopy(),
          },
        ].forEach(({ scope, heading, copy }) => {
          const el = sectionRef.current?.querySelector(scope);
          if (!el) return;

          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: el,
              // Matches the stacked cadence in Comparision: hold off until the
              // block is genuinely in view rather than as it clears the fold.
              start: 'center 85%',
              end: 'bottom 60%',
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });

          tl.to(
            {},
            {
              duration: 1,
              onUpdate() {
                heading.current?.setProgress(this.progress());
              },
            },
            0,
          );

          driveCopy(tl, copy, { time: 0.3 }, 0.11, 0.5);

          tl.to(
            `${scope} [data-point-dot]`,
            {
              scale: 1,
              autoAlpha: 1,
              duration: 0.3,
              stagger: 0.11,
              ease: 'power2.out',
            },
            0.52,
          );
        });
      });


      ScrollTrigger.refresh();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id='before-after'
      className='relative z-10 h-[400vh] w-full bg-background text-foreground max-md:h-auto'
    >
      <div className='sticky top-0 h-screen w-full overflow-hidden max-md:static max-md:flex max-md:h-auto max-md:flex-col max-md:gap-[8vw] max-md:overflow-visible max-md:px-[7%] max-md:py-[16vw] max-md:pb-[20vw]'>

        <div className='absolute inset-0 px-[3vw] py-[4vw] max-md:contents'>
          <div className='w-[30vw] max-md:order-1 max-md:w-full'>
            <SplitLineReveal
              ref={beforeHeadingRef}
              as='h2'
              className='text-[5vw] text-[#0A0A0A] font-medium leading-[0.95] tracking-[-0.02em] max-md:text-[13vw]'
            >
              Before
            </SplitLineReveal>

            <div data-before-copy className='mt-[1.6vw] max-md:mt-[4vw]'>
              <SplitLineReveal
                ref={beforeLeadRef}
                as='p'
                className='text24 font-medium text-[#0A0A0A]'
                duration={0.9}
                stagger={0.1}
              >
                Built with AI in an afternoon
              </SplitLineReveal>

              <PointList
                points={BEFORE_POINTS}
                itemRefs={beforeItemRefs}
                className='mt-[1vw] max-md:mt-[4vw]'
              />
            </div>
          </div>
        </div>

        {/* Right column — image on top, After copy underneath so they never overlap.
            On mobile the order flips: the After copy reads first, then its image. */}
        <div className='absolute bottom-[4vw] right-[2vw] top-[5vw] flex w-[60vw] flex-col max-md:contents'>
          <div
            data-stage
            className='relative min-h-0 flex-1 overflow-visible max-md:contents'
          >
            <div
              data-after-frame
              className='absolute inset-0 will-change-transform max-md:static max-md:order-4 max-md:aspect-video max-md:h-auto max-md:w-full'
            >
              <Image
                src='/imgs/after.png'
                alt='The same site rebuilt by Verdikt'
                width={1277}
                height={718}
                className='h-full w-full object-cover'
              />
            </div>

            <div
              data-before-frame
              className='pointer-events-none absolute inset-0 origin-center will-change-transform max-md:static max-md:order-2 max-md:aspect-video max-md:h-auto max-md:w-full'
            >
              <Image
                src='/imgs/before.png'
                alt='A site built with AI tooling'
                width={1277}
                height={718}
                className='h-full w-full object-cover'
              />
            </div>
          </div>

          <div
            data-after-copy
            className='mt-[1.4vw] flex items-end justify-between gap-[2vw] max-md:order-3 max-md:mt-0 max-md:mb-0 max-md:flex-col max-md:items-start max-md:gap-[4vw]'
          >
            <div className='min-w-0 max-md:w-full'>
              <SplitLineReveal
                ref={afterHeadingRef}
                as='h2'
                className='text-[5vw] text-[#0A0A0A] font-medium leading-[0.95] tracking-[-0.02em] max-md:text-[13vw]'
              >
                After
              </SplitLineReveal>

              <SplitLineReveal
                ref={afterLeadRef}
                as='p'
                wrapperClassName='mt-[0.4vw] max-md:mt-[2vw]'
                className='text24 font-medium text-[#0A0A0A]'
                duration={0.9}
                stagger={0.1}
              >
                Rebuilt by Verdikt
              </SplitLineReveal>
            </div>

            <PointList
              points={AFTER_POINTS}
              itemRefs={afterItemRefs}
              className='mb-[0.15vw] w-[25vw] shrink-0 max-md:mb-0 max-md:w-full'
            />
          </div>
        </div>

        <div
          data-before-slot
          aria-hidden='true'
          className='pointer-events-none invisible absolute bottom-[4vw] left-[2vw] aspect-video w-[32vw] max-md:hidden'
        />

      </div>
    </section>
  );
}
