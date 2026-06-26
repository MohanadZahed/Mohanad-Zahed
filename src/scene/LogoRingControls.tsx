import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { Group } from 'three';
import { useScrollStore } from '../store/useScrollStore';
import { VISUAL_CENTER_OFFSET_Y } from './Avatar';
import { LOGO_FADE_END } from '../sections/hero.constants';
import { clamp, lerp } from './lib/math';
import { ORBIT_MAX_VIEWPORT_FRACTION } from './lib/logoPosition';

// --- Tuning knobs -----------------------------------------------------------
// Radians of ring spin per CSS pixel of horizontal drag (1:1 grab feel).
const DRAG_SENSITIVITY = 0.005;
// Post-release momentum decay (per second). Higher = settles back to the idle
// drift faster. exp(-DECAY·dt): ~2.0 ⇒ the flick eases out over ~1–2s.
const DECAY = 2.0;
// Clamp the release flick so a violent swipe can't fling the ring absurdly fast.
const MAX_VEL = 12; // rad/s
// Grabbable disc as a fraction of the ring's pixel radius. Inner = 0 so the
// centre (the avatar itself) is grabbable too — pressing the avatar spins the
// ring. Outer extends a bit past the ring so the logos are easy to catch.
const ANNULUS_INNER = 0;
const ANNULUS_OUTER = 1.35;
// Hero-only gate: grabbing is live only while we're still at the top of the page
// (before the ring shrinks + scrolls away with About).
const HERO_GRAB_MAX = 0.03;
// Ring radius in world units while in the hero state (see logoPosition.ts).
const HERO_RING_RADIUS = 4;
// ---------------------------------------------------------------------------

interface LogoRingControlsProps {
  anchorRef: React.RefObject<Group | null>;
}

/**
 * Lets the user grab the logo ring with the mouse and spin it.
 *
 * The <Canvas> wrapper is `pointer-events-none` (scroll passes through it), so
 * R3F's raycast/pointer system is unavailable here. Instead we attach
 * window-level pointer listeners and hit-test a screen-space annulus that we
 * recompute each frame by projecting the ring's world centre + radius. Desktop
 * scroll is wheel-driven (Lenis), so a horizontal mouse drag never scrolls.
 *
 * The drag feeds `useScrollStore.logoSpin` — a purely additive angular offset.
 * While dragging, the angle tracks the mouse 1:1; on release the captured
 * velocity becomes momentum that decays back to 0, returning the ring to its
 * idle/scroll spin with no seam.
 *
 * Renders nothing. Disabled entirely on coarse-pointer (touch) devices.
 */
export function LogoRingControls({ anchorRef }: LogoRingControlsProps) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const viewport = useThree((s) => s.viewport);
  const coarse = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
    [],
  );

  // Screen-space ring geometry, refreshed each frame.
  const cx = useRef(0);
  const cy = useRef(0);
  const pxRadius = useRef(0);
  const interactive = useRef(false); // hero-gated + geometry valid

  // Drag / momentum state.
  const dragging = useRef(false);
  const vel = useRef(0); // rad/s
  const angle = useRef(0); // cumulative offset written to the store
  const lastX = useRef(0);
  const lastT = useRef(0);
  const cursorSet = useRef(false);

  const worldCenter = useMemo(() => new Vector3(), []);
  const right = useMemo(() => new Vector3(), []);

  useEffect(() => {
    if (coarse) return;

    const inAnnulus = (x: number, y: number) => {
      const r = pxRadius.current;
      if (r <= 0) return false;
      const d = Math.hypot(x - cx.current, y - cy.current);
      return d >= r * ANNULUS_INNER && d <= r * ANNULUS_OUTER;
    };

    const setCursor = (value: string) => {
      document.body.style.cursor = value;
      cursorSet.current = value !== '';
    };

    const onMove = (e: PointerEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      if (dragging.current) {
        const now = performance.now();
        const dt = Math.max((now - lastT.current) / 1000, 1e-3);
        const dx = x - lastX.current;
        // Negated so the ring spins the same way the mouse moves: drag right →
        // spins right, drag left → spins left.
        const delta = -dx * DRAG_SENSITIVITY;
        angle.current += delta; // immediate 1:1 grab
        vel.current = lerp(vel.current, delta / dt, 0.3); // for the release flick
        lastX.current = x;
        lastT.current = now;
        return;
      }
      const over = interactive.current && inAnnulus(x, y);
      if (over && !cursorSet.current) setCursor('grab');
      else if (!over && cursorSet.current) setCursor('');
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || !interactive.current || !inAnnulus(e.clientX, e.clientY)) return;
      dragging.current = true;
      vel.current = 0;
      lastX.current = e.clientX;
      lastT.current = performance.now();
      setCursor('grabbing');
      document.body.style.userSelect = 'none';
      e.preventDefault();
    };

    const onUp = (e: PointerEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      vel.current = clamp(vel.current, -MAX_VEL, MAX_VEL);
      document.body.style.userSelect = '';
      const stillOver = interactive.current && inAnnulus(e.clientX, e.clientY);
      setCursor(stillOver ? 'grab' : '');
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      if (cursorSet.current) document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [coarse]);

  useFrame((_, delta) => {
    if (coarse) return;
    const anchor = anchorRef.current;
    if (!anchor) return;

    // --- Recompute the ring's screen-space centre + pixel radius ------------
    worldCenter.set(0, VISUAL_CENTER_OFFSET_Y, 0).applyMatrix4(anchor.matrixWorld);
    right.setFromMatrixColumn(camera.matrixWorld, 0); // camera's world X axis

    const c = worldCenter.clone().project(camera);
    cx.current = (c.x * 0.5 + 0.5) * size.width;
    cy.current = (1 - (c.y * 0.5 + 0.5)) * size.height;

    // Match the visual ring's capped radius (see logoPosition.ts): world radius =
    // local × scale = min(4·scale, frac·viewportWidth), so the grab annulus stays
    // aligned with the pulled-in logos.
    const worldRadius = Math.min(
      HERO_RING_RADIUS * anchor.scale.x,
      ORBIT_MAX_VIEWPORT_FRACTION * viewport.width,
    );
    const edge = worldCenter
      .clone()
      .addScaledVector(right, worldRadius)
      .project(camera);
    const ex = (edge.x * 0.5 + 0.5) * size.width;
    const ey = (1 - (edge.y * 0.5 + 0.5)) * size.height;
    pxRadius.current = Math.hypot(ex - cx.current, ey - cy.current);

    const { progress, heroStartedAt, setLogoSpin } = useScrollStore.getState();
    // Grab only after the intro has played the avatar + ring in — otherwise the
    // grab cursor shows over an empty/un-rendered scene. heroStartedAt is the
    // shared intro clock origin; LOGO_FADE_END is when the ring is fully visible.
    const introDone =
      heroStartedAt != null && (performance.now() - heroStartedAt) / 1000 >= LOGO_FADE_END;
    interactive.current = introDone && progress < HERO_GRAB_MAX;

    // --- Integrate momentum (only when not actively dragging) ---------------
    if (!dragging.current && vel.current !== 0) {
      angle.current += vel.current * delta;
      vel.current *= Math.exp(-DECAY * delta);
      if (Math.abs(vel.current) < 1e-4) vel.current = 0;
    }

    setLogoSpin(angle.current);
  });

  return null;
}
