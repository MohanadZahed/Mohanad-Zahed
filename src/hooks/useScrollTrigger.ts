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

    return () => {
      trigger.kill();
    };
  }, []);
}
