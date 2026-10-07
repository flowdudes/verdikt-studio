import Image from 'next/image';
import React from 'react';
import ButtonComponent from '../Resuable/ButtonComponent';
import ScrambleShader from './ScrambleShader';
import { FadeUp, LineReveal } from '../Animations/gsapAnim';

const CARDS = [
  {
    title: (
      <>
        Move it to Webflow.
      </>
    ),
    body: 'Same site, rebuilt properly. Clean structure, real CMS, fast, and you can edit it yourself without breaking anything.',
    image: '/imgs/gap1.png',
  },
  {
    title: (
      <>
        Make it move.
      </>
    ),
    body: 'Scroll, hover and transitions built onto the site you already have, so it stops sitting there and starts reading like intent.',
    image: '/imgs/gap2.png',
  },
  {
    title: (
      <>
        Rebuild the whole thing.
      </>
    ),
    body: 'Design, build and motion from scratch. The version you would have shipped if the tool had not decided it for you.',
    image: '/imgs/gap3.png',
  },
];

export default function TakeAllOfIt() {
  return (
    <section id='Take-all-of-it' className='h-[calc(20vh+120vw)] max-md:h-auto mt-[-120vw] max-md:mt-[-170vh] w-full bg-white px-[2vw] max-md:px-[7%] flex items-end justify-center max-md:pt-[16vw] max-md:pb-[16vw]'>
      <div className='relative z-100 h-screen max-md:h-auto w-full flex gap-[3vw] pt-[5vw] pb-[3vw] max-md:flex-col max-md:gap-[10vw] max-md:pt-0 max-md:pb-0'>
        <div className='flex w-[34vw] shrink-0 flex-col justify-between max-md:w-full max-md:gap-[8vw]'>
          <div>
            <LineReveal as='h2' className='text48 font-medium text-foreground'>
              Take all of it, <br /> or take one part.
            </LineReveal>
            <LineReveal
              as='p'
              className='text28 mt-[1.4vw] max-w-[30vw] text-foreground max-md:mt-[4vw] max-md:max-w-full'
            >
              Not everyone needs a rebuild. Pick the one that matches where you
              are, or send the link and we will tell you.
            </LineReveal>
          </div>
          <FadeUp>
            <p className='text20 max-w-[16vw] text-foreground max-md:max-w-full'>
              Not sure which one? Send the link and we will tell you.
            </p>
            <ButtonComponent
              text='Send me your site'
              href='#contact'
              className='mt-[1.2vw] w-fit max-md:mt-[4vw]'
            />
          </FadeUp>
        </div>
        <div className='flex h-full flex-1 border border-foreground/15 max-md:h-auto max-md:flex-col'>
          {CARDS.map((card, i) => (
            <div
              key={i}
              className='group relative h-full flex-1 overflow-hidden bg-white not-first:border-l not-first:border-foreground/15 max-md:h-auto max-md:not-first:border-l-0 max-md:not-first:border-t'
            >
              <div className='pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:opacity-100'>
                <div
                  className='absolute inset-0'
                  style={{
                    background: 'linear-gradient(135deg, #410120 0%, #A70050 100%)',
                  }}
                />
                <Image
                  src={card.image}
                  alt=''
                  width={1000}
                  height={1000}
                  className='absolute inset-0 h-full w-full object-cover grayscale mix-blend-overlay'
                />
                <span aria-hidden='true' className='absolute inset-0 bg-secondary/25' />
                <ScrambleShader charSize={9} hoverRadius={160} />
              </div>
              <div className='relative flex h-full flex-col justify-between p-[1.2vw] pb-[2vw] max-md:gap-[10vw] max-md:p-[6vw]'>
                <span className=' text16 text-foreground/50 transition-colors duration-500 group-hover:text-background'>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className='text30 w-[12vw] text-foreground font-medium transition-colors duration-500 group-hover:text-background max-md:w-full'>
                    {card.title}
                  </h3>
                  <div className='grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:grid-rows-[1fr] max-md:grid-rows-[1fr]'>
                    <div className='overflow-hidden'>
                      <p className='text20 mt-[0.9vw] leading-normal text-background opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:opacity-100 max-md:mt-[3vw] max-md:text-foreground max-md:opacity-100'>
                        {card.body}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
