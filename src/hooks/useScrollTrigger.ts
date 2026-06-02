import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollStore } from '../store/useScrollStore';
import { getLenis } from './useLenis';

gsap.registerPlugin(ScrollTrigger);

export function useScrollTrigger() {
  useEffect(() => {
    const lenis = getLenis();
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      // Lenis' stock recipe disables lag smoothing (lagSmoothing(0)), but that
      // makes GSAP apply the *full* wall-clock gap after a main-thread stall in
      // one tick — so the WebGL init hitch (~300ms while the avatar/logo shaders
      // compile, ~0.8s in) freezes the hero name-reveal tween and then snaps it
      // to the end. Re-enabling with a 150ms threshold absorbs that hitch: any
      // frame slower than 150ms is treated as 33ms, so the tween resumes smoothly
      // instead of jumping. Normal-cadence frames (<150ms) are unaffected, so
      // scroll feel is unchanged — this only ever fires on a genuine stall.
      gsap.ticker.lagSmoothing(150, 33);
    }

    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        useScrollStore.getState().setProgress(self.progress);
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);
}
