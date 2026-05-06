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

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${rect.width / 2}px`);
      el.style.setProperty('--my', `${rect.height / 2}px`);
      return;
    }

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      el.style.setProperty('--my', `${e.clientY - rect.top}px`);
    };
    const onLeave = () => {
      el.style.setProperty('--mx', `-9999px`);
      el.style.setProperty('--my', `-9999px`);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
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
          '--mx': '-9999px',
          '--my': '-9999px',
          '--spot-r': `${SPOTLIGHT_RADIUS}px`,
        } as CSSProperties
      }
    >
      <CircuitBackground />
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
