import { Suspense, useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { MathUtils } from 'three';
import type { Group } from 'three';
import { Avatar, VISUAL_CENTER_OFFSET_Y } from './Avatar';
import { Orbit } from './Orbit';
import { YogaAvatar } from './YogaAvatar';
import { MathBackdrop } from './MathBackdrop';
import { useScrollStore } from '../store/useScrollStore';
import { smoothstep } from './lib/math';
import { rectToWorld } from './lib/projectAnchor';

// Blend window for the hero→about handoff: driven by the About anchor's
// on-screen position, not global scroll. Avatar reaches its final pose when
// the anchor div has scrolled up to 30% from viewport bottom (= 70% from top).
const BLEND_START_FROM_BOTTOM = 1.0;  // anchor at viewport bottom → blend = 0
const BLEND_END_FROM_BOTTOM = 0.3;    // anchor 30% from bottom → blend = 1
// Anchor shrinks on narrow viewports so the avatar + orbit fit. At desktop aspect
// (≈1.78), viewport.width ≈ 13.3 → ratio clamps to 1. On a phone (≈3.45), the floor
// is tuned so the avatar lands at ≈ 165 CSS px tall on the smallest screen.
const SCALE_REFERENCE_WIDTH = 9;
const SCALE_MIN = 0.28;

export function Scene() {
  const anchorRef = useRef<Group>(null);
  const heroAnchorRef = useRef<Element | null>(null);
  const aboutAnchorRef = useRef<Element | null>(null);
  const viewport = useThree((s) => s.viewport);

  // The Knowledge-only payload (yoga GLB ≈ 18.5 MB + MathBackdrop's SVG textures)
  // is heavy and not seen until ~29% scroll, so it must stay off the initial load.
  // Mount it the first time Knowledge starts approaching (knowledgeApproach > 0,
  // ~1 viewport before it pins — written by Knowledge.tsx). The preload kicks off
  // the GLB fetch a beat before React mounts <YogaAvatar />. If this lead ever
  // proves too short on slow links, move the trigger earlier (e.g. Skills start).
  const [knowledgeReady, setKnowledgeReady] = useState(
    () => useScrollStore.getState().knowledgeApproach > 0,
  );
  useEffect(() => {
    if (knowledgeReady) return;
    const unsub = useScrollStore.subscribe((s) => {
      if (s.knowledgeApproach > 0) {
        useGLTF.preload('/models/avatar-yoga.glb');
        setKnowledgeReady(true);
        unsub();
      }
    });
    return unsub;
  }, [knowledgeReady]);

  useFrame((_, delta) => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const heroEl =
      heroAnchorRef.current ?? document.querySelector('[data-avatar-anchor="hero"]');
    const aboutEl =
      aboutAnchorRef.current ?? document.querySelector('[data-avatar-anchor="about"]');
    if (!heroEl || !aboutEl) return;
    heroAnchorRef.current = heroEl;
    aboutAnchorRef.current = aboutEl;

    const targetScale = MathUtils.clamp(viewport.width / SCALE_REFERENCE_WIDTH, SCALE_MIN, 1);
    const nextScale = MathUtils.damp(anchor.scale.x, targetScale, 4, delta);
    anchor.scale.setScalar(nextScale);

    const aboutRect = aboutEl.getBoundingClientRect();
    const hero = rectToWorld(heroEl.getBoundingClientRect(), viewport);
    const about = rectToWorld(aboutRect, viewport);

    // Blend driven by where the About anchor sits on screen. smoothstep clamps,
    // so the avatar holds at the About pose once the anchor passes the threshold.
    const vh = document.documentElement.clientHeight;
    const aboutCenterFromTop = aboutRect.top + aboutRect.height / 2;
    const t = smoothstep(vh * BLEND_START_FROM_BOTTOM, vh * BLEND_END_FROM_BOTTOM, aboutCenterFromTop);
    useScrollStore.getState().setAvatarBlend(t);

    const targetX = MathUtils.lerp(hero.x, about.x, t);
    const targetY = MathUtils.lerp(hero.y, about.y, t);

    anchor.position.x = MathUtils.damp(anchor.position.x, targetX, 4, delta);
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
        <group position={[0, VISUAL_CENTER_OFFSET_Y, 0]}>
          <Orbit />
        </group>
      </group>

      {knowledgeReady && (
        <Suspense fallback={null}>
          <MathBackdrop />
          <YogaAvatar />
        </Suspense>
      )}
    </>
  );
}
