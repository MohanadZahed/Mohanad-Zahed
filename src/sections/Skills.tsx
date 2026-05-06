import { useEffect, useRef, type CSSProperties } from 'react';
import { useScrollStore } from '../store/useScrollStore';
import { SECTION_VH } from './notebook/notebook.constants';
import { CircuitBackground, SPOTLIGHT_RADIUS } from './skills/CircuitBackground';
import { ChipScatter } from './skills/ChipScatter';

const HANDOFF_DISTANCE_VH = (1 - 0.82) * SECTION_VH;

export function Skills() {
  const handoff = useScrollStore((s) => s.notebookHandoff);
  const translateY = -handoff * HANDOFF_DISTANCE_VH;
  const rootRef = useRef<HTMLElement>(null);
  const circuitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = rootRef.current;
    const target = circuitRef.current;
    if (!section || !target) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      const rect = section.getBoundingClientRect();
      target.style.setProperty('--mx', `${rect.width / 2}px`);
      target.style.setProperty('--my', `${rect.height / 2}px`);
      return;
    }

    let raf = 0;
    let nextX = -9999;
    let nextY = -9999;
    let rectLeft = 0;
    let rectTop = 0;

    const refreshRect = () => {
      const r = section.getBoundingClientRect();
      rectLeft = r.left;
      rectTop = r.top;
    };
    refreshRect();

    const flush = () => {
      raf = 0;
      target.style.setProperty('--mx', `${nextX}px`);
      target.style.setProperty('--my', `${nextY}px`);
    };

    const onMove = (e: PointerEvent) => {
      nextX = e.clientX - rectLeft;
      nextY = e.clientY - rectTop;
      if (!raf) raf = requestAnimationFrame(flush);
    };
    const onLeave = () => {
      nextX = -9999;
      nextY = -9999;
      if (!raf) raf = requestAnimationFrame(flush);
    };

    section.addEventListener('pointermove', onMove, { passive: true });
    section.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', refreshRect, { passive: true });
    window.addEventListener('resize', refreshRect, { passive: true });
    return () => {
      section.removeEventListener('pointermove', onMove);
      section.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', refreshRect);
      window.removeEventListener('resize', refreshRect);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={rootRef}
      aria-labelledby='skills-h2'
      className='relative min-h-screen overflow-hidden bg-canvas-gradient'
      style={
        {
          transform: `translateY(${translateY}vh)`,
          zIndex: 20,
          willChange: 'transform',
          '--spot-r': `${SPOTLIGHT_RADIUS}px`,
        } as CSSProperties
      }
    >
      <CircuitBackground ref={circuitRef} />
      <header className='relative z-20 px-8 sm:px-16 pt-12 pointer-events-none'>
        <h2
          id='skills-h2'
          className='text-3xl sm:text-4xl font-semibold text-zinc-100 tracking-tight'
        >
          Skills
        </h2>
        <p className='mt-2 text-sm text-zinc-400 max-w-md'>
          The board I build on. Hover to light up the traces.
        </p>
      </header>

      <ChipScatter />
    </section>
  );
}
