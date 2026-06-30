import { useEffect } from 'react';
import Lenis from 'lenis';
import { useScrollStore } from '../store/useScrollStore';
import { HERO_O_TRAVEL_DELAY, HERO_O_TRAVEL_DUR } from '../sections/hero.constants';

let lenisInstance: Lenis | null = null;

// Scroll stays locked through the hero load intro and releases the instant the
// gold "O" lands in its slot — i.e. when the O-travel beat ends. Same clock as
// every other intro layer: seconds from `useScrollStore.heroStartedAt`.
const HERO_SCROLL_UNLOCK = HERO_O_TRAVEL_DELAY + HERO_O_TRAVEL_DUR; // = 2.5s

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
 * Detection only *arms* after the first genuine user scroll input (`wheel` /
 * `touchstart` / `keydown`). Until then the detector silently trails `pivot` and
 * never fires `cb`, so the browser's scroll-restoration jump on refresh — a
 * programmatic downward scroll — can't false-trigger a "hide". The chrome must
 * only ever hide in response to a real user scroll-down; programmatic scrolls
 * (restoration, `ScrollTrigger.refresh()`, the hero intro's `stop()/start()`)
 * leave it visible.
 *
 * Returns an unsubscribe fn.
 */
export function onScrollIntent(cb: (down: boolean) => void): () => void {
  const THRESHOLD = 12; // px of reversal before a direction flip registers (swallows fling bounce)
  let dir: 'up' | 'down' | null = null;
  let pivot = window.scrollY;
  let armed = false;

  const arm = () => {
    if (armed) return;
    armed = true;
    pivot = window.scrollY; // re-baseline off the (possibly restored) resting position
    dir = null;
    removeInputListeners();
  };
  const removeInputListeners = () => {
    window.removeEventListener('wheel', arm);
    window.removeEventListener('touchstart', arm);
    window.removeEventListener('keydown', arm);
  };
  window.addEventListener('wheel', arm, { passive: true });
  window.addEventListener('touchstart', arm, { passive: true });
  window.addEventListener('keydown', arm, { passive: true });

  const onScroll = () => {
    const y = window.scrollY;
    if (!armed) {
      pivot = y; // trail the restoration jump silently — no direction fired until armed
      return;
    }
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
  return () => {
    window.removeEventListener('scroll', onScroll);
    removeInputListeners();
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

    // Lock scrolling during the hero load intro; release once the "O" is placed.
    // Reduced-motion skips the intro entirely, so don't lock there.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let unlockTimer = 0;
    let unsubscribe: (() => void) | undefined;

    if (!reduceMotion) {
      lenis.stop();
      const releaseAfter = (startedAt: number) => {
        const remaining = Math.max(0, HERO_SCROLL_UNLOCK * 1000 - (performance.now() - startedAt));
        unlockTimer = window.setTimeout(() => lenis.start(), remaining);
      };
      const started = useScrollStore.getState().heroStartedAt;
      if (started != null) {
        releaseAfter(started);
      } else {
        unsubscribe = useScrollStore.subscribe((state) => {
          if (state.heroStartedAt != null) {
            unsubscribe?.();
            releaseAfter(state.heroStartedAt);
          }
        });
      }
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(unlockTimer);
      unsubscribe?.();
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);
}
