import { useEffect } from 'react';
import Lenis from 'lenis';

let lenisInstance: Lenis | null = null;

export const getLenis = () => lenisInstance;

/**
 * Fire `cb(down)` once per real scroll-direction change, where `down` is the
 * direction of travel. Reads the *native* document scroll position
 * (`window.scrollY`) on the `scroll` event, with a small px hysteresis
 * threshold so the rubber-band bounce at the tail of an iOS momentum fling
 * doesn't flip the direction.
 *
 * Deliberately bypasses Lenis' own `scroll` value: on iOS that value is
 * re-derived per RAF and can be non-monotonic during a fling, which made a
 * threshold detector flap and restart the consumers' CSS slide transition
 * mid-fling (the "logo freezes halfway, then finishes when the slide stops"
 * bug). The raw scroll position is monotonic through a fling, so direction is
 * unambiguous and the transition fires exactly once.
 *
 * This is the one spot we read scroll natively rather than via the store — it's
 * UI chrome, not 3D choreography. Lenis writes the real document `scrollTop`
 * every frame (it doesn't translate a wrapper), so `window.scrollY` is accurate
 * on desktop too and `scroll` fires each Lenis RAF.
 *
 * Returns an unsubscribe fn.
 */
export function onScrollIntent(cb: (down: boolean) => void): () => void {
  const THRESHOLD = 12; // px of reversal before a direction flip registers (swallows fling bounce)
  let dir: 'up' | 'down' | null = null;
  let pivot = window.scrollY;

  const onScroll = () => {
    const y = window.scrollY;
    if (dir !== 'down' && y > pivot + THRESHOLD) {
      dir = 'down';
      pivot = y;
      cb(true);
    } else if (dir !== 'up' && y < pivot - THRESHOLD) {
      dir = 'up';
      pivot = y;
      cb(false);
    } else if (dir === 'down' && y > pivot) {
      pivot = y; // still descending — trail the lowest point
    } else if (dir === 'up' && y < pivot) {
      pivot = y; // still ascending — trail the highest point
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
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
