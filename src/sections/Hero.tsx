import { useRef } from 'react';
import { HeroBackground } from './HeroBackground';
import { HeroLogo } from './HeroLogo';

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id='Hero'
      aria-labelledby='hero-h1'
      className='relative overflow-hidden h-[100svh]'
    >
      <HeroBackground triggerRef={sectionRef} />

      {/* Avatar landing spot — the 3D scene measures this rect and projects it
          into world space; the avatar + tech ring fade in here after the logo
          intro completes (see the AVATAR_FADE / LOGO_FADE windows in hero.constants). */}
      <div
        data-avatar-anchor='hero'
        aria-hidden='true'
        className='pointer-events-none absolute left-1/2 top-[52svh] sm:top-[38svh] md:top-1/2 size-0'
      />

      {/* Typographic logo intro + persistent corner mark (fixed overlay). */}
      <HeroLogo triggerRef={sectionRef} />
    </section>
  );
}
