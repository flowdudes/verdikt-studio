import { Arrow } from '@/utils/Icons'

/**
 * One work card. The inner image area is a transparent placeholder: the actual
 * pixels are drawn by the WebGL plane in WorkCanvas, which tracks `imageRef`'s
 * rect every frame. Nothing here paints the artwork.
 *
 * Colour is inherited, so the host section decides light-on-dark or the
 * reverse with a single text-* class.
 */
export default function ProjectBox({
  width,
  height,
  title,
  tags = [],
  className = '',
  imageRef,
  href,
  children,
  ref,
}) {
  const tagList = Array.isArray(tags) ? tags : [tags].filter(Boolean)
  const Wrapper = href ? 'a' : 'div'

  return (
    <Wrapper
      ref={ref}
      href={href}
      target={href ? '_blank' : undefined}
      rel={href ? 'noopener noreferrer' : undefined}
      className={`group flex flex-col gap-[0.8vw] max-md:w-full! ${href ? 'cursor-pointer' : ''} ${className}`}
      style={{ width }}
    >
      <div
        ref={imageRef}
        data-work-plane
        className="relative w-full overflow-hidden max-md:h-[60vw]!"
        style={{ height }}
      >
        {children}
      </div>

      {(title || tagList.length > 0) && (
        <div className="relative flex w-full items-center gap-[1vw]">
          {title && (
            <div className="flex min-w-0 items-center">
              {/* Arrow reveals from the left on hover — the grid column grows
                  from 0fr so the title slides over to make room. */}
              <span className="grid grid-cols-[0fr] overflow-hidden transition-[grid-template-columns] duration-300 ease-out group-hover:grid-cols-[1fr]">
                <span className="min-w-0 overflow-hidden">
                  <Arrow className="mr-[0.45vw] size-[1.15vw] -translate-x-full transition-transform duration-300 ease-out group-hover:translate-x-0 max-md:size-4" />
                </span>
              </span>
              <p className="text24 font-pp translate-x-0 text-[#DCDCDC] tracking-wide transition-transform duration-300 ease-out group-hover:translate-x-[0.15vw] max-md:mt-[4vw] max-md:text-sm">
                {title}
              </p>
            </div>
          )}
          {tagList.length > 0 && (
            <p className="text16 ml-auto shrink-0 font-medium uppercase tracking-wide opacity-60 max-md:hidden">
              [ {tagList.join(', ')} ]
            </p>
          )}
        </div>
      )}
    </Wrapper>
  )
}
