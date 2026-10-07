// The VS mark as a nine-point polygon, plus the geometry that places it.
//
// Every point exists in every stage — the flat sides carry doubled points that
// only pull apart later — so any two stages tween into each other by lerping
// pairwise. Stage 0 is a plain square, stage 3 the finished mark.
//
// The hero builds the mark on scroll, 0 to 3. The loader runs the same stages
// backwards, 3 to 0, so the mark it opens on unbuilds into the square that
// then grows into the hero. Both read from here: one set of numbers to change.

export const PATH_W = 352.022;
export const PATH_H = 337.553;

// Same column count as StripTransition. The collapsed cube is an odd number
// of those columns, centered, so the dashed borders sit on the strip seams.
export const STRIP_COUNT = 5;
export const SQUARE = 1 / STRIP_COUNT;
export const SQUARE_MOBILE_COLS = 3;
export const SQUARE_MOBILE_MAX_PX = 260;

// Matches the `max-md:` breakpoint the styles use, so the mark changes size at
// the same width the rest of the layout does.
export const MOBILE_MAX = 1025;

function snapToStripColumns(vw, rawWidth) {
  const col = vw / STRIP_COUNT;
  let cols = Math.round(rawWidth / col);
  if (cols % 2 === 0) cols += rawWidth / col >= cols ? 1 : -1;
  cols = Math.max(1, Math.min(STRIP_COUNT, cols));
  return cols * col;
}

function squareWidth(vw) {
  const col = vw / STRIP_COUNT;
  if (vw > MOBILE_MAX) return col * 1;
  return snapToStripColumns(
    vw,
    Math.min(col * SQUARE_MOBILE_COLS, SQUARE_MOBILE_MAX_PX),
  );
}

export const STAGES = [
  [[0, 0], [110.614, 0], [110.614, 0], [138.754, 0], [138.754, 0], [352.022, 0], [352.022, 337.553], [352.022, 337.553], [0, 337.553]],
  [[0, 0], [110.614, 0], [110.614, 0], [138.754, 0], [138.754, 0], [352.022, 0], [352.022, 119.893], [124.929, 337.553], [0, 337.553]],
  [[0, 0], [110.614, 0], [110.614, 292.270], [138.754, 292.270], [138.754, 0], [352.022, 0], [352.022, 119.893], [124.929, 337.553], [0, 337.553]],
  [[0, 0], [110.614, 0], [110.614, 292.271], [138.754, 292.271], [222.213, 0], [352.022, 0], [352.022, 119.893], [124.929, 337.553], [0, 337.553]],
].map((stage) => stage.map(([x, y]) => [x / PATH_W, y / PATH_H]));

// The finished mark. Where the loader starts and the hero ends.
export const LAST_STAGE = STAGES.length - 1;

// Where the cube sits inside a `vw` x `vh` box, and how big it is. Kept
// separate from the clip so callers can hang other things off the same edges —
// the hero pins its dashed grid lines to them.
export function boxGeometry(vw, vh) {
  // `vw` is the element's own width, which is the viewport's here for both
  // callers — the loader overlay and the hero stage are each full-bleed.
  const w = squareWidth(vw);
  const h = w * (PATH_H / PATH_W);
  return { vw, vh, x: (vw - w) / 2, y: (vh - h) / 2, w, h };
}

/**
 * A `polygon()` for the mark at `morph` (0..3), drawn inside a frame that
 * `box` slides between the full `vw` x `vh` bleed (0) and the centred cube (1).
 *
 * Returned in percentages, so the same string keeps working if the clipped
 * element is re-laid-out before the next draw.
 */
export function morphClipPath(geo, box, morph) {
  const { vw, vh, x, y, w, h } = geo;
  const bx = x * box;
  const by = y * box;
  const bw = vw + (w - vw) * box;
  const bh = vh + (h - vh) * box;

  const i = Math.max(0, Math.min(Math.floor(morph), STAGES.length - 2));
  const f = morph - i;
  const a = STAGES[i];
  const b = STAGES[i + 1];

  let points = "";
  for (let p = 0; p < a.length; p++) {
    const nx = a[p][0] + (b[p][0] - a[p][0]) * f;
    const ny = a[p][1] + (b[p][1] - a[p][1]) * f;
    const px = ((bx + nx * bw) / vw) * 100;
    const py = ((by + ny * bh) / vh) * 100;
    points += `${p ? "," : ""}${px.toFixed(3)}% ${py.toFixed(3)}%`;
  }
  return `polygon(${points})`;
}
