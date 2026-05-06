import { useEffect, useRef } from 'react';
import { useScrollStore } from '../store/useScrollStore';

export function HeroBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const apply = (progress: number) => {
      const t = Math.min(Math.max(progress / 0.2, 0), 1);
      el.style.opacity = String(1 - t);
    };

    apply(useScrollStore.getState().progress);
    return useScrollStore.subscribe((state) => apply(state.progress));
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden='true'
      className='fixed inset-0 -z-30 pointer-events-none'
      style={{
        backgroundImage: 'url(/hero-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
}
