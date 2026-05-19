import { useEffect, useRef, type RefObject } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type Props = {
  triggerRef: RefObject<HTMLElement | null>;
};

export function HeroBackground({ triggerRef }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    const trigger = triggerRef.current;
    if (!el || !trigger) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const st = ScrollTrigger.create({
      trigger,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        el.style.transform = `translate3d(0, ${self.progress * 8}%, 0)`;
      },
    });

    return () => st.kill();
  }, [triggerRef]);

  return (
    <picture>
      <source media='(max-width: 767px)' srcSet='/hero-bg-sm.png' />
      {/* TODO: drop in when files land
      <source media='(max-width: 1279px)' srcSet='/hero-bg-md.png' />
      <source media='(max-width: 1919px)' srcSet='/hero-bg-lg.png' />
      */}
      <img
        ref={imgRef}
        src='/hero-bg-xl.png'
        alt=''
        aria-hidden='true'
        decoding='async'
        fetchPriority='high'
        className='absolute inset-x-0 top-[-10%] w-full h-[120%] object-cover object-center will-change-transform pointer-events-none select-none -z-20'
      />
    </picture>
  );
}
