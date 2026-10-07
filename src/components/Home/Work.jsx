'use client'

import { createRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { LineReveal } from '@/components/Animations/gsapAnim'
import ProjectBox from '@/components/Resuable/ProjectBox'

// WebGL only — the canvas measures live DOM rects and touches `window`, so it
// must not be prerendered.
const WorkCanvas = dynamic(() => import('@/components/Shaders/WorkCanvas'), {
  ssr: false,
})

// Two staggered columns, 47vw each with a 2vw gutter, inside the section's
// 2vw padding. Box sizes track each source image's aspect ratio: WorkCanvas
// draws the texture with `cover`, so a box far off its image's shape crops the
// artwork. Comments are the source aspect (w/h) each box is tuned against.
const WORKS = [
  {
    title: 'Jewelry', // 1500x1125 — 1.33
    src: '/imgs/work/jewelry.webp',
    href: 'https://toqirchatha.com/',
    tags: ['website'],
    width: '47vw',
    height: '34vw',
  },
  {
    title: 'LivLive+', // 2688x2742 — 0.98
    src: '/imgs/work/livlive.webp',
    href: 'https://toqirchatha.com/',
    tags: ['website'],
    width: '47vw',
    height: '46vw',
  },
  {
    title: 'Diagonal Media', // 1500x1125 — 1.33
    src: '/imgs/work/diagonal-media.webp',
    href: 'https://toqirchatha.com/',
    tags: ['website'],
    width: '44vw',
    height: '32vw',
  },
  {
    title: 'Pillar', // 1228x1280 — 0.96
    src: '/imgs/work/pillar.webp',
    href: 'https://toqirchatha.com/',
    tags: ['product'],
    width: '22.5vw',
    height: '23vw',
  },
  {
    title: 'Influint', // 2676x2728 — 0.98
    src: '/imgs/work/influint.webp',
    href: 'https://toqirchatha.com/',
    tags: ['branding'],
    width: '22.5vw',
    height: '23vw',
  },
  {
    title: 'Gorilla Engineering', // 1500x1125 — 1.33
    src: '/imgs/work/gorilla-engineering.webp',
    href: 'https://toqirchatha.com/',
    tags: ['website'],
    width: '47vw',
    height: '34vw',
  },
  {
    title: 'U Social', // 2496x2728 — 0.91
    src: '/imgs/work/u-social.webp',
    href: 'https://toqirchatha.com/',
    tags: ['product'],
    width: '38vw',
    height: '42vw',
    // Drops the left column below the right one, echoing the first block.
    className: 'mt-[5vw] max-md:mt-0!',
  },
  {
    title: 'Objective Foundation', // 2496x2546 — 0.98
    src: '/imgs/work/objective-foundation.webp',
    href: 'https://toqirchatha.com/',
    tags: ['product'],
    width: '47vw',
    height: '46vw',
  },
  {
    title: 'Vine', // 2412x2474 — 0.97
    src: '/imgs/work/vine.webp',
    href: 'https://toqirchatha.com/',
    tags: ['branding'],
    width: '43vw',
    height: '43vw',
  },
  {
    title: 'Surround', // 2688x2742 — 0.98
    src: '/imgs/work/surround.webp',
    href: 'https://toqirchatha.com/',
    tags: ['branding'],
    width: '47vw',
    height: '46vw',
  },
]

// Every row is `items-start` so a tall card never drags its neighbour down —
// the ragged bottom edge is the point.
const ROW = 'flex w-full items-start gap-[2vw] max-md:flex-col max-md:gap-12'

export default function Work() {
  // One stable ref per card — the canvas reads these rects every frame. Held
  // in state rather than a ref so the array can be read during render.
  const [boxRefs] = useState(() => WORKS.map(() => createRef()))

  return (
    <section
      id="work"
      className="relative h-fit  w-full bg-secondary pb-[8vw] px-[2vw] max-md:px-[7%] text-[#DCDCDC] mt-[-28vw]"
    >
      <WorkCanvas items={WORKS} boxRefs={boxRefs} target="#work" />

      {/* Heading holds the left column, the standfirst sits over the right */}
      <div className="relative z-200 flex w-full items-start justify-between gap-[2vw] pb-[7vw] max-md:flex-col max-md:gap-6 max-md:pb-10">
        <LineReveal
          as="h2"
          className="text48 text-[#DCDCDC] font-pp font-medium max-w-[30vw] max-md:max-w-full max-md:text-2xl"
        >
          Work that
          <br />
          does the talking.
        </LineReveal>
        <LineReveal
          as="p"
          className="text28 w-[30vw] text-[#B0B0B0CF] opacity-60 max-md:w-full max-md:text-sm"
        >
          The tools are genuinely good at shipping something. They are not good
          at making it feel like anything.
        </LineReveal>
      </div>

      {/* Grid — above the canvas so titles and tags stay crisp DOM text */}
      <div className="relative z-200 flex h-fit w-full flex-col gap-[8vw] max-md:gap-12">
        <div className={ROW}>
          <ProjectBox {...WORKS[0]} imageRef={boxRefs[0]} />
          <ProjectBox {...WORKS[1]} imageRef={boxRefs[1]} />
        </div>

        {/* Wide card against a stacked pair, the pair dropped a beat lower */}
        <div className={`${ROW} justify-between`}>
          <ProjectBox {...WORKS[2]} imageRef={boxRefs[2]} />
          <div className="flex items-start gap-[2vw] mt-[3vw] max-md:mt-0 max-md:w-full max-md:flex-col max-md:gap-12">
            <ProjectBox {...WORKS[3]} imageRef={boxRefs[3]} />
            <ProjectBox {...WORKS[4]} imageRef={boxRefs[4]} />
          </div>
        </div>

        {/* Right column alone — the empty left half is the breathing room */}
        <div className={`${ROW} justify-end`}>
          <ProjectBox {...WORKS[5]} imageRef={boxRefs[5]} />
        </div>

        <div className={`${ROW} justify-between`}>
          <ProjectBox {...WORKS[6]} imageRef={boxRefs[6]} />
          <ProjectBox {...WORKS[7]} imageRef={boxRefs[7]} />
        </div>

        <div className={`${ROW} justify-start`}>
          <ProjectBox {...WORKS[8]} imageRef={boxRefs[8]} />
        </div>

        <div className={`${ROW} justify-end`}>
          <ProjectBox {...WORKS[9]} imageRef={boxRefs[9]} />
        </div>
      </div>
    </section>
  )
}
