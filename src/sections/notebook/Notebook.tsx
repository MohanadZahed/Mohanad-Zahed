import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { NotebookStage } from './NotebookStage';
import { SECTION_VH } from './notebook.constants';

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
        setProgress(self.progress);
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <section
      ref={sectionRef}
      id='notebook'
      aria-labelledby='notebook-h2'
      className='relative'
      style={{ height: `${SECTION_VH}svh` }}
    >
      <NotebookStage progress={progress} />
    </section>
  );
}
