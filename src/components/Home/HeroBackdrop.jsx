"use client";
import ScrambleShader from "./ScrambleShader";

// The hero's ground: the gradient with the scrambling glyph field over it.
// The loader wears the same thing inside its cube, so when the cube grows to
// fill the window it lands on an identical picture and the swap is invisible.
export default function HeroBackdrop() {
  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(135deg, #410120 0%, #A70050 100%)" }}
      />
      <ScrambleShader />
    </>
  );
}
