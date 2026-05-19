import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollStore } from '../../store/useScrollStore';
import { KnowledgeStage } from './KnowledgeStage';
import { SECTION_VH } from './knowledge.constants';

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
      exitTrigger.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby='knowledge-h2'
      className='relative'
      style={{ height: `${SECTION_VH}svh` }}
    >
      <KnowledgeStage progress={progress} />
    </section>
  );
}
