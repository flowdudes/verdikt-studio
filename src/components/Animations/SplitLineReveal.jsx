'use client'

import { useEffect, useImperativeHandle, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/dist/SplitText'

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

export const SPLIT_LINE_CLASS = 'sl-line'

/**
 * Masked line-by-line reveal: each line slides up from behind its own
 * overflow-clipped wrapper.
 *
 * Three ways to drive it:
 *  - self-driven (default) — its own ScrollTrigger, played once when the
 *    heading hits `start`. Pass `once={false}` with a `scrub` value to tie it
 *    to scroll position instead, or `once={false} scrub={false}` to play on
 *    enter and reverse on the way back up.
 *  - scrubbed by a parent — pass a `ref` and call `setProgress(0..1)` from
 *    whatever already owns the scroll, e.g. Showreel's master timeline.
 *  - toggled — pass a boolean `play`.
 *
 * `autoSplit` re-splits on resize / font load; the timeline is rebuilt in
 * `onSplit` and re-synced to the progress it was already at.
 */
export default function SplitLineReveal({
  children,
  as: Tag = 'h2',
  className = '',
  // Layout classes belong here when the reveal is a flex/grid child — the
  // wrapper is the item the parent lays out, the tag only sizes itself.
  wrapperClassName = '',
  ref,
  play,
  // Fire-and-forget on the way in. `scrub` and `end` only apply when off.
  once = true,
  scrub = 0.3,
  start = 'top 85%',
  end = 'top 40%',
  // Selector (or element) to measure `start`/`end` against, for when the
  // heading is a bad reference for its own reveal — a sticky footer sits at a
  // fixed viewport offset, so its start fires on load.
  trigger,
  duration = 1,
  stagger = 0.12,
  ease = 'power3.out',
}) {
  const wrapRef = useRef(null)
  const textRef = useRef(null)
  const timelineRef = useRef(null)
  // Where the reveal stands right now, so a re-split (resize, font swap) can
  // rebuild the timeline and jump straight back to it.
  const progressRef = useRef(0)
  // Latched once the one-shot has run, so a re-split doesn't replay it.
  const playedRef = useRef(false)

  const toggled = typeof play === 'boolean'
  // A forwarded ref means the parent scrubs this itself through setProgress.
  const driven = toggled || ref != null

  useGSAP(
    () => {
      const element = textRef.current
      if (!element) return

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      gsap.set(element, { opacity: 1 })

      if (prefersReducedMotion) return

      const split = SplitText.create(element, {
        type: 'lines',
        mask: 'lines',
        linesClass: SPLIT_LINE_CLASS,
        autoSplit: true,
        onSplit(self) {
          // A one-shot that has already fired rebuilds as a finished timeline
          // with no trigger at all — resizing past the heading must not run it
          // a second time.
          const spent = !driven && once && playedRef.current
          const resolved =
            (typeof trigger === 'string'
              ? document.querySelector(trigger)
              : trigger) || wrapRef.current

          const tl = gsap.timeline(
            driven || spent
              ? { paused: true }
              : once
                ? {
                    onComplete() {
                      playedRef.current = true
                    },
                    scrollTrigger: {
                      trigger: resolved,
                      start,
                      once: true,
                    },
                  }
                : {
                    scrollTrigger: {
                      trigger: resolved,
                      start,
                      end,
                      scrub,
                      toggleActions: 'play none none reverse',
                    },
                  },
          )

          tl.from(self.lines, { yPercent: 110, duration, stagger, ease })

          timelineRef.current = tl

          if (driven) tl.progress(toggled ? (play ? 1 : 0) : progressRef.current)
          else if (spent) tl.progress(1)

          return tl
        },
      })

      return () => {
        timelineRef.current = null
        split.revert()
      }
    },
    {
      scope: wrapRef,
      dependencies: [
        driven,
        duration,
        ease,
        end,
        once,
        scrub,
        stagger,
        start,
        toggled,
        trigger,
      ],
    },
  )

  useImperativeHandle(
    ref,
    () => ({
      setProgress(progress) {
        progressRef.current = progress
        timelineRef.current?.progress(progress)
      },
    }),
    [],
  )

  useEffect(() => {
    if (!toggled) return

    const tl = timelineRef.current
    if (!tl) return

    if (play) tl.play()
    else tl.reverse()
  }, [play, toggled])

  return (
    <div ref={wrapRef} className={`split-line-reveal ${wrapperClassName}`}>
      <Tag ref={textRef} className={`opacity-0 ${className}`}>
        {children}
      </Tag>
    </div>
  )
}
