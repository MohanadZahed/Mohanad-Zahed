import { Suspense, useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { MathUtils } from 'three';
import type { Group } from 'three';
import { Avatar, VISUAL_CENTER_OFFSET_Y } from './Avatar';
import { Orbit } from './Orbit';
import { LogoRingControls } from './LogoRingControls';
import { YogaAvatar } from './YogaAvatar';
import { MathBackdrop } from './MathBackdrop';
import { useScrollStore } from '../store/useScrollStore';
import { LOGO_FADE_END } from '../sections/hero.constants';
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

// Knowledge warm-up: how long after the hero intro clock starts before the
// Knowledge-only subtree (yoga GLB + math SVGs) is mounted. `LOGO_FADE_END` is
// the last intro beat, so the fetch + glTF parse + shader compile land in the
// calm hero-idle stage rather than hitching a tween mid-intro.
const KNOWLEDGE_WARMUP_DELAY_S = LOGO_FADE_END + 0.3;

export function Scene() {
  const anchorRef = useRef<Group>(null);
  const heroAnchorRef = useRef<Element | null>(null);
  const aboutAnchorRef = useRef<Element | null>(null);
  const viewport = useThree((s) => s.viewport);

  // The Knowledge-only payload (yoga GLB + MathBackdrop's SVG textures) is not
  // seen until ~29% scroll, so it must stay out of the initial load — and out of
  // `useProgress`, which gates the hero veil (see App.tsx HeroIntroGate).
  //
  // Mounting this subtree *is* the fetch (drei's Suspense cache), so it doubles
  // as the preload. It mounts at whichever comes first:
  //   1. `assetsReady` AND KNOWLEDGE_WARMUP_DELAY_S past the intro clock — a head
  //      start of the whole Hero → About → Manifesto → Skills stretch, instead of
  //      the single viewport the old `knowledgeApproach` trigger allowed.
  //   2. `knowledgeApproach > 0` (~1 viewport before Knowledge pins, written by
  //      Knowledge.tsx) — the fallback for a visitor who flings straight down, and
  //      for data-saver / never-finishes-loading cases where (1) never fires.
  const [knowledgeReady, setKnowledgeReady] = useState(
    () => useScrollStore.getState().knowledgeApproach > 0,
  );
  useEffect(() => {
    if (knowledgeReady) return;

    let timer = 0;
    let scheduled = false;

    // `unsub` is declared below; nothing can call cleanup before that line runs.
    const cleanup = () => {
      window.clearTimeout(timer);
      unsub();
    };
    const ready = () => {
      cleanup();
      setKnowledgeReady(true);
    };

    // On a metered/data-saver connection don't spend the visitor's bytes ahead of
    // time — fall back to fetching on Knowledge approach only. `saveData` isn't in
    // the TS DOM lib, hence the narrow local cast.
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData;

    const consider = (s: ReturnType<typeof useScrollStore.getState>) => {
      if (s.knowledgeApproach > 0) {
        ready();
        return;
      }
      if (scheduled || saveData) return;
      // `assetsReady` (not just `heroStartedAt`) is the gate: HeroIntroGate's
      // safety timeout can stamp the clock while the hero avatar is still
      // downloading, and starting a second GLB then just splits the pipe —
      // measured on Slow 4G, it pushed avatar.glb's completion from ~17 s to
      // ~64 s. Wait for the hero to be genuinely done, then add the intro delay.
      if (!s.assetsReady || s.heroStartedAt == null) return;
      scheduled = true;
      const elapsedS = (performance.now() - s.heroStartedAt) / 1000;
      timer = window.setTimeout(ready, Math.max(0, (KNOWLEDGE_WARMUP_DELAY_S - elapsedS) * 1000));
    };

    const unsub = useScrollStore.subscribe(consider);
    consider(useScrollStore.getState());

    return cleanup;
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
    useScrollStore.getState().setAnchorScale(nextScale);

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

      <LogoRingControls anchorRef={anchorRef} />

      {knowledgeReady && (
        <Suspense fallback={null}>
          <MathBackdrop />
          <YogaAvatar />
          {/* Compiles the yoga material + math planes as soon as they resolve
              (drei's Preload temporarily un-hides invisible objects), so
              Knowledge's first rendered frame isn't a program-compile +
              texture-upload hitch mid-scroll. App.tsx's <Preload all /> can't
              cover them — it runs gl.compile once, before this subtree exists. */}
          <Preload all />
        </Suspense>
      )}
    </>
  );
}
