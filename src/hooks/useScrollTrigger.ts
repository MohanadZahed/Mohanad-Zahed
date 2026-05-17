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
      gsap.ticker.lagSmoothing(0);
    }

    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        useScrollStore.getState().setProgress(self.progress);
      },
    });

    // iOS Chrome/Safari fire visualViewport.resize when the URL bar slides in/out,
    // changing dvh-based section heights. Refresh so ScrollTrigger remeasures.
    let rafId = 0;
    const onVVResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    const vv = window.visualViewport;
    vv?.addEventListener('resize', onVVResize);

    return () => {
      trigger.kill();
      vv?.removeEventListener('resize', onVVResize);
      cancelAnimationFrame(rafId);
    };
  }, []);
}
