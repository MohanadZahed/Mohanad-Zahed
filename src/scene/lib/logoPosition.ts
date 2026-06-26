import { lerp, smoothstep } from './math';

// Radius ramp range — narrow values must stay in sync with HORIZ_START_NARROW /
// HORIZ_END_NARROW in Scene.tsx so the orbs settle to their close pose at the
// same scroll point the avatar reaches the heading.
// Numerators are vh-offsets into the page; denominator is the total scroll range
// (≈ 32.77vh after the Manifesto→Skills rework) so the ramp fires at a fixed
// document position. This band sits deep in the Hero — the denominator shift is
// imperceptible, but kept in sync for correctness.
const RADIUS_START = 0.41 / 32.77;
const RADIUS_END = 0.82 / 32.77;
const RADIUS_START_NARROW = 0;
const RADIUS_END_NARROW = 0.01;
const NARROW_MAX_PX = 900;
const ORBIT_RADIUS_NARROW = 1.3;

// The orbit radius (logo → avatar distance) is capped to this fraction of the
// viewport width, so the far-left → far-right logo span never exceeds 2× this
// (≈ 50% of the viewport). Consumed by LogoPlane (visual) + LogoRingControls
// (drag hit-test) so the grab annulus tracks the capped ring.
export const ORBIT_MAX_VIEWPORT_FRACTION = 0.25;

export function logoPosition(
  index: number,
  total: number,
  progress: number,
  time: number,
  spin: number = 0,
  maxRadius: number = Infinity,
): [number, number, number] {
  const isNarrow = typeof window !== 'undefined' && window.innerWidth < NARROW_MAX_PX;
  const rStart = isNarrow ? RADIUS_START_NARROW : RADIUS_START;
  const rEnd = isNarrow ? RADIUS_END_NARROW : RADIUS_END;
  const minRadius = isNarrow ? ORBIT_RADIUS_NARROW : 1.5;
  const radius = Math.min(lerp(4, minRadius, smoothstep(rStart, rEnd, progress)), maxRadius);
  const idleSpin = time * 0.08;
  const scrollSpin = progress * 2;
  const angle = (index / total) * Math.PI * 2 + idleSpin + scrollSpin + spin;
  const tilt = Math.sin(progress * Math.PI * 2 + index) * 0.5;
  return [Math.cos(angle) * radius, tilt, Math.sin(angle) * radius];
}
