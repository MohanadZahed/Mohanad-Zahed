import { useEffect } from 'react';
import Lenis from 'lenis';

let lenisInstance: Lenis | null = null;

export const getLenis = () => lenisInstance;

/**
 * Fire `cb(down)` on raw scroll *input* — `wheel` + touch-drag — where `down`
 * is the input direction. Unlike Lenis' `direction` / accumulated progress
 * deltas (which keep reporting all through the momentum glide and jitter at the
 * decelerating tail), input events fire ONLY when the user actually scrolls, so
 * a listener reacts once per gesture and never re-triggers during the glide.
 * Returns an unsubscribe fn.
 */
export function onScrollIntent(cb: (down: boolean) => void): () => void {
  const onWheel = (e: WheelEvent) => {
    if (e.deltaY !== 0) cb(e.deltaY > 0);
  };
  let lastTouchY: number | null = null;
  const onTouchStart = (e: TouchEvent) => {
    lastTouchY = e.touches[0]?.clientY ?? null;
  };
  const onTouchMove = (e: TouchEvent) => {
    const y = e.touches[0]?.clientY;
    if (y == null || lastTouchY == null) return;
    const dy = lastTouchY - y; // finger moves up → scrolling down
    if (dy !== 0) cb(dy > 0);
    lastTouchY = y;
  };
  window.addEventListener('wheel', onWheel, { passive: true });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  return () => {
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
  };
}

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisInstance = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);
}
