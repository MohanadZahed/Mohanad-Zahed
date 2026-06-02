import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ManifestoStage } from './ManifestoStage';
import { SECTION_VH } from './manifesto.constants';

gsap.registerPlugin(ScrollTrigger);

export function Manifesto() {
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
      id='manifesto'
      aria-labelledby='manifesto-h2'
      className='relative'
      style={{ height: `${SECTION_VH}svh` }}
    >
      <ManifestoStage progress={progress} />
    </section>
  );
}
