import { useEffect, useRef, type CSSProperties } from 'react';
import { CircuitBackground, SPOTLIGHT_RADIUS } from './skills/CircuitBackground';
import { ChipScatter } from './skills/ChipScatter';
import { useT } from '../i18n/useT';

export function Skills() {
  const { t } = useT();
  const stageRef = useRef<HTMLElement>(null);
  const circuitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const target = circuitRef.current;
    if (!stage || !target) return;

    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (coarse) {
      target.style.setProperty('--mx', '-9999px');
      target.style.setProperty('--my', '-9999px');
      return;
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      const rect = stage.getBoundingClientRect();
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
      const r = stage.getBoundingClientRect();
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

    stage.addEventListener('pointermove', onMove, { passive: true });
    stage.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', refreshRect, { passive: true });
    window.addEventListener('resize', refreshRect, { passive: true });
    return () => {
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', refreshRect);
      window.removeEventListener('resize', refreshRect);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={stageRef}
      aria-labelledby='skills-h2'
      className='relative min-h-screen overflow-hidden bg-canvas-gradient'
      style={{ '--spot-r': `${SPOTLIGHT_RADIUS}px`, marginTop: '-2000px' } as CSSProperties}
    >
      <CircuitBackground ref={circuitRef} />
      <header className='relative z-20 px-5 sm:px-10 md:px-16 pt-12 pointer-events-none'>
        <h2
          id='skills-h2'
          className='text-2xl sm:text-3xl md:text-4xl font-semibold text-zinc-100 tracking-tight'
        >
          {t('skills.heading')}
        </h2>
        <p className='mt-2 text-sm text-zinc-400 max-w-md'>{t('skills.subhead')}</p>
      </header>

      <ChipScatter />
    </section>
  );
}
