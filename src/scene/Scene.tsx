import { Suspense, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils } from 'three';
import type { Group } from 'three';
import { Avatar } from './Avatar';
import { Orbit } from './Orbit';
import { YogaAvatar } from './YogaAvatar';
import { useScrollStore } from '../store/useScrollStore';
import { lerpRamp, smoothstep } from './lib/math';

const ANCHOR_LEFT_X = -2.6;
// Thresholds rebased after inserting the 3vh Certificates section between Knowledge
// and Experience. Anchors in vh-from-top: HORIZ_START=0.41, HORIZ_END=0.82,
// ABOUT_CENTER=0.85. Scroll range ≈ 31.25vh.
const HORIZ_START = 0.41 / 31.25;
const HORIZ_END = 0.82 / 31.25;
// On narrow viewports (<900px) the avatar lands on the right side of the
// "Über mich" heading instead of behind the body column, and reaches its end
// pose much earlier (≈ progress 0.0065 — about half-way through Hero) so it's
// already settled before About scrolls into view.
const HORIZ_START_NARROW = 0;
const HORIZ_END_NARROW = 0.01;
const ABOUT_CENTER_PROGRESS = 0.85 / 31.25;
const HERO_Y_OFFSET = -1;
const HERO_Y_OFFSET_NARROW = 0;
// End-pose target on narrow viewports, expressed as a 2-point linear ramp
// between 490 px and 899 px viewport width. Lets the avatar sit just right of
// the heading at 490 px and slide further right (toward the screen edge) at
// 899 px, where the heading occupies a smaller fraction of the screen.
const ANCHOR_NARROW_END_PX_AT_490 = 360;
const ANCHOR_NARROW_END_PX_AT_899 = 710;
// World-unit Y of the avatar's end pose on narrow viewports. Piecewise ramp
// instead of a single linear lerp because the heading's apparent screen-Y
// shifts non-monotonically as the viewport widens (font/padding clamp +
// per-device innerHeight variations). Edit the [vw, worldY] pairs to nudge
// each width band independently — values between breakpoints are linearly
// interpolated. Positive Y = above viewport centre, negative = below.
const ANCHOR_NARROW_Y_RAMP: ReadonlyArray<readonly [number, number]> = [
  [490, 0.4],
  [680, 0.0],
  [767, -0.4],
  [768, -1.8],
  [830, -2.0],
  [899, -2.2],
];
// Desktop end-pose Y next to the About column. Negative = down, positive = up.
const ANCHOR_DESKTOP_Y_END = -1.4;
const NARROW_MAX_PX = 900;
const MOBILE_MAX_PX = 480;
// Anchor shrinks on narrow viewports so the avatar + orbit fit. At desktop aspect
// (≈1.78), viewport.width ≈ 13.3 → ratio clamps to 1. On a phone (≈3.45), the floor
// is tuned so the avatar lands at ≈ 165 CSS px tall on the smallest screen.
const SCALE_REFERENCE_WIDTH = 9;
const SCALE_MIN = 0.28;

export function Scene() {
  const anchorRef = useRef<Group>(null);
  const viewport = useThree((s) => s.viewport);

  useFrame((_, delta) => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const progress = useScrollStore.getState().progress;

    // Reading window.innerWidth per frame is cheap and avoids the re-render path
    // that a resize-listening hook would introduce inside the canvas loop.
    const vw = window.innerWidth;
    const isNarrow = vw < NARROW_MAX_PX;
    const narrowT = MathUtils.clamp((NARROW_MAX_PX - vw) / (NARROW_MAX_PX - MOBILE_MAX_PX), 0, 1);

    const targetScale = MathUtils.clamp(viewport.width / SCALE_REFERENCE_WIDTH, SCALE_MIN, 1);
    const nextScale = MathUtils.damp(anchor.scale.x, targetScale, 4, delta);
    anchor.scale.setScalar(nextScale);

    // 0 at vw ≤ 490, 1 at vw ≥ 899 — drives the narrow end-pose ramp.
    const narrowEndT = MathUtils.clamp(
      (vw - MOBILE_MAX_PX) / (NARROW_MAX_PX - 1 - MOBILE_MAX_PX),
      0,
      1,
    );
    const anchorNarrowEndPx = MathUtils.lerp(
      ANCHOR_NARROW_END_PX_AT_490,
      ANCHOR_NARROW_END_PX_AT_899,
      narrowEndT,
    );
    const anchorNarrowYEnd = lerpRamp(vw, ANCHOR_NARROW_Y_RAMP);

    const horizStart = isNarrow ? HORIZ_START_NARROW : HORIZ_START;
    const horizEnd = isNarrow ? HORIZ_END_NARROW : HORIZ_END;
    const tHoriz = smoothstep(horizStart, horizEnd, progress);
    const anchorEndX = isNarrow ? (anchorNarrowEndPx / vw - 0.5) * viewport.width : ANCHOR_LEFT_X;
    const targetX = tHoriz * anchorEndX * (isNarrow ? 1 : nextScale);
    anchor.position.x = MathUtils.damp(anchor.position.x, targetX, 4, delta);

    const totalScrollPx = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    // On narrow viewports, pinning to About kicks in the moment the avatar
    // lands beside the heading (i.e. at horizEnd) instead of at the desktop
    // About-centre threshold — otherwise pinning lags ~0.018 behind.
    const pinStart = isNarrow ? horizEnd : ABOUT_CENTER_PROGRESS;
    const pxPastAboutCenter = Math.max(0, progress - pinStart) * totalScrollPx;
    const heroBaseY = MathUtils.lerp(HERO_Y_OFFSET, HERO_Y_OFFSET_NARROW, narrowT);
    const heroOffset = heroBaseY * (1 - smoothstep(0, horizStart || HORIZ_START, progress));
    const aboutY = (isNarrow ? anchorNarrowYEnd : ANCHOR_DESKTOP_Y_END) * tHoriz;
    const targetY =
      heroOffset + aboutY + (pxPastAboutCenter / window.innerHeight) * viewport.height;
    anchor.position.y = MathUtils.damp(anchor.position.y, targetY, 6, delta);
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[0, 5, 5]} intensity={1} color='#ffffff' />
      <directionalLight position={[0, 1.5, 4]} intensity={0.6} color='#fff2e0' />
      <pointLight position={[-4, 2, -2]} intensity={2} color='#818cf8' />
      <pointLight position={[4, 0, 2]} intensity={1} color='#38bdf8' />

      <group ref={anchorRef}>
        <Suspense fallback={null}>
          <Avatar />
        </Suspense>
        <Orbit />
      </group>

      <Suspense fallback={null}>
        <YogaAvatar />
      </Suspense>
    </>
  );
}
