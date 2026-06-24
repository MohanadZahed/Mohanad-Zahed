import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollStore } from '../../store/useScrollStore';
import { KnowledgeStage } from './KnowledgeStage';
import { BEIGE_FADE_END_PCT, BEIGE_FADE_START_PCT, SECTION_VH } from './knowledge.constants';

gsap.registerPlugin(ScrollTrigger);

export function Knowledge() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const pinTrigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = self.progress;
        setProgress(p);
        useScrollStore.getState().setKnowledgeProgress(p);
      },
    });

    const approachTrigger = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'top top',
      onUpdate: (self) => {
        useScrollStore.getState().setKnowledgeApproach(self.progress);
      },
    });

    // Beige backdrop pre-paint: ramps to full one viewport before Knowledge
    // enters the viewport, entirely behind Skills' opaque black, so the fade is
    // never seen — Knowledge reveals an already-solid backdrop. Separate from
    // `knowledgeApproach` (which still gates the avatar/math/scene-mount).
    const beigeTrigger = ScrollTrigger.create({
      trigger: el,
      start: `top ${BEIGE_FADE_START_PCT}%`,
      end: `top ${BEIGE_FADE_END_PCT}%`,
      onUpdate: (self) => {
        useScrollStore.getState().setKnowledgeBeige(self.progress);
      },
    });

    const exitTrigger = ScrollTrigger.create({
      trigger: el,
      start: 'bottom bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        useScrollStore.getState().setKnowledgeExit(self.progress);
      },
    });

    return () => {
      pinTrigger.kill();
      approachTrigger.kill();
      beigeTrigger.kill();
      exitTrigger.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id='Knowledge'
      aria-labelledby='knowledge-h2'
      className='relative'
      style={{ height: `${SECTION_VH}svh` }}
    >
      <KnowledgeStage progress={progress} />
    </section>
  );
}
