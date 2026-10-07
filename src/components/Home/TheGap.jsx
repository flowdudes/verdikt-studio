import Image from 'next/image';
import React from 'react';
import { FadeUp, LineReveal } from '../Animations/gsapAnim';

const POINTS = [
  'Nothing moves. It loads, it sits there, and that is the whole experience.',
  'The layout is whatever the tool defaults to, so it looks like the ten thousand other sites built from the same prompts.',
  'The spacing, the hierarchy, the rhythm. All slightly wrong in ways you can feel but not name.',
  'It breaks in places on mobile and you have stopped checking.',
  'Every change means going back to the tool and hoping it does not undo something else.',
];

export default function TheGap() {
  return (
    <section id='the-gap' className='h-[150vh] max-md:h-auto max-md:pb-[20vw] z-10 relative mt-[-70vw] w-full bg-secondary text-background max-md:mt-[-140vh]'>
      <div className='px-[2vw] pt-[6vw] max-md:px-[7%] max-md:pt-[18vw]'>

        {/* Row 1 — section label / heading + lead */}
        <div className='flex gap-[3vw] max-md:flex-col max-md:gap-[6vw]'>
          <div className='w-[36vw] shrink-0 font-mono text16 uppercase max-md:w-full'>
            <p className='text-primary'>003</p>
            <p className='text-background'>The Gap</p>
          </div>

          <div className='w-[55vw] max-md:w-full'>
            <LineReveal as='h2' className='text48 font-pp text-[#DCDCDC] opacity-80 font-medium'>
              AI got you to live. <br /> It cannot get you to good.
            </LineReveal>
            <LineReveal
              as='p'
              className='text28 mt-[1.6vw] max-w-[30vw] text-[#B0B0B0]  max-md:mt-[4vw] max-md:max-w-full'
            >
              The tools are genuinely good at shipping something. They are not
              good at making it feel like anything.
            </LineReveal>
          </div>
        </div>

        {/* Row 2 — visual / numbered list */}
        <div className='mt-[8vw] flex items-center gap-[3vw] max-md:mt-[14vw] max-md:flex-col max-md:items-start max-md:gap-[8vw]'>
          {/* FadeUp owns the transform on its own element, so the hover scale
              lives on the inner image and the two never fight. */}
          <FadeUp className='w-[36vw] shrink-0 max-md:w-full'>
            <div className='group relative aspect-3/2 w-full overflow-hidden bg-primary/20'>
              <Image
                src='/imgs/gap.png'
                alt='The Gap'
                width={1000}
                height={1000}
                className='h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105'
              />
            </div>
          </FadeUp>

          <div className='w-[55vw] max-md:w-full'>
            {POINTS.map((point, i) => (
              <FadeUp
                key={point}
                delay={i * 0.08}
                className='flex items-center gap-[1.2vw] py-[1.1vw] first:pt-0 relative max-md:gap-[4vw] max-md:py-[4vw]'
              >
                <span className='flex size-[2.7vw] shrink-0 items-center justify-center bg-primary text-[#F8F8FF] text16 max-md:size-[9vw]'>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className='text20 text-background/65'>{point}</p>
                {/* Use a span as a divider instead of border */}
                {i < POINTS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none text-[#9F9F9F] absolute left-0 right-0 bottom-0 h-px bg-background/15"
                  />
                )}
              </FadeUp>
            ))}
          </div>
    
        </div>

      </div>
    </section>
  );
}
