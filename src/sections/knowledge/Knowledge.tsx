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

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = self.progress;
        setProgress(p);
        useScrollStore.getState().setKnowledgeProgress(p);
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby='knowledge-h2'
      className='relative'
      style={{ height: `${SECTION_VH}vh` }}
    >
      <KnowledgeStage progress={progress} />
    </section>
  );
}
