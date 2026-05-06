import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollStore } from '../../store/useScrollStore';
import { smoothstep } from '../../scene/lib/math';
import { NotebookStage } from './NotebookStage';
import { PHASE, SECTION_VH } from './notebook.constants';

gsap.registerPlugin(ScrollTrigger);

export function Notebook() {
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
        const store = useScrollStore.getState();
        store.setNotebookProgress(p);
        const handoff = smoothstep(PHASE.HANDOFF_START, PHASE.HANDOFF_END, p);
        store.setNotebookHandoff(handoff);
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby='notebook-h2'
      className='relative'
      style={{ height: `${SECTION_VH}vh` }}
    >
      <NotebookStage progress={progress} />
    </section>
  );
}
