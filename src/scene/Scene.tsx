import { Suspense, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils } from 'three';
import type { Group } from 'three';
import { Avatar } from './Avatar';
import { Orbit } from './Orbit';
import { YogaAvatar } from './YogaAvatar';
import { useScrollStore } from '../store/useScrollStore';
import { smoothstep } from './lib/math';

const ANCHOR_LEFT_X = -2.6;
// Thresholds rebased after inserting the 3vh Certificates section between Knowledge
// and Experience. Anchors in vh-from-top: HORIZ_START=0.41, HORIZ_END=0.82,
// ABOUT_CENTER=0.85. Scroll range ≈ 31.25vh.
const HORIZ_START = 0.41 / 31.25;
const HORIZ_END = 0.82 / 31.25;
const ABOUT_CENTER_PROGRESS = 0.85 / 31.25;
const HERO_Y_OFFSET = -1;
// Anchor shrinks on narrow viewports so the avatar + orbit fit. At desktop aspect
// (≈1.78), viewport.width ≈ 13.3 → ratio clamps to 1. On a phone (≈3.45), the floor
// keeps the avatar legible.
const SCALE_REFERENCE_WIDTH = 9;
const SCALE_MIN = 0.4;

export function Scene() {
  const anchorRef = useRef<Group>(null);
  const viewport = useThree((s) => s.viewport);

  useFrame((_, delta) => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const progress = useScrollStore.getState().progress;

    const targetScale = MathUtils.clamp(viewport.width / SCALE_REFERENCE_WIDTH, SCALE_MIN, 1);
    const nextScale = MathUtils.damp(anchor.scale.x, targetScale, 4, delta);
    anchor.scale.setScalar(nextScale);

    const tHoriz = smoothstep(HORIZ_START, HORIZ_END, progress);
    const targetX = tHoriz * ANCHOR_LEFT_X * nextScale;
    anchor.position.x = MathUtils.damp(anchor.position.x, targetX, 4, delta);

    const totalScrollPx = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pxPastAboutCenter = Math.max(0, progress - ABOUT_CENTER_PROGRESS) * totalScrollPx;
    const heroOffset = HERO_Y_OFFSET * (1 - smoothstep(0, HORIZ_START, progress));
    const targetY = heroOffset + (pxPastAboutCenter / window.innerHeight) * viewport.height;
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
