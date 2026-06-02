import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { useScrollStore } from '../store/useScrollStore';
import { useT } from '../i18n/useT';
import { HeroBackground } from './HeroBackground';
import {
  HERO_NAME_DELAY,
  HERO_NAME_DUR,
  HERO_TITLE_DELAY,
  HERO_TAGLINE_DELAY,
} from './hero.constants';

function MaskedChars({ text }: { text: string }) {
  return (
    <span aria-hidden='true' className='inline-block whitespace-nowrap'>
      {[...text].map((char, i) =>
        char === ' ' ? (
          <span key={i} className='inline-block w-[0.4em]' />
        ) : (
          <span key={i} className='inline-block' data-char>
            {char}
          </span>
        ),
      )}
    </span>
  );
}

export function Hero() {
  const { t } = useT();
  const NAME = t('hero.name');
  const TITLE = t('hero.title');
  const TAGLINE = t('hero.tagline');
  const nameRef = useRef<HTMLHeadingElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const nameEl = nameRef.current;
    const titleEl = titleRef.current;
    const taglineEl = taglineRef.current;
    if (!nameEl || !titleEl || !taglineEl) return;

    const titleChars = titleEl.querySelectorAll('[data-char]');

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(nameEl, { width: 'auto', opacity: 1 });
      gsap.set([...titleChars], { yPercent: 0 });
      gsap.set(taglineEl, { opacity: 1, y: 0 });
      return;
    }

    // Hide everything immediately (before paint) so nothing flashes during the
    // pre-intro hold while the WebGL scene loads. Measure natural width first.
    gsap.set(nameEl, { width: 'auto', opacity: 0 });
    const naturalWidth = nameEl.offsetWidth;
    gsap.set(nameEl, { width: 0, opacity: 0 });
    gsap.set(titleChars, { yPercent: 110 });
    gsap.set(taglineEl, { opacity: 0, y: 16 });

    let tl: gsap.core.Timeline | null = null;

    // Build + play the reveal once the shared intro clock starts (scene ready),
    // so the GPU init hitch can't freeze the name-reveal tween mid-fold.
    const start = () => {
      if (tl) return;
      tl = gsap.timeline();

      tl.to(
        nameEl,
        {
          width: naturalWidth,
          opacity: 1,
          duration: HERO_NAME_DUR,
          ease: 'power4.out',
          onComplete: () => gsap.set(nameEl, { width: 'auto' }),
        },
        HERO_NAME_DELAY,
      );

      // Title and tagline wait for the background SVGs to fly in and settle.
      tl.to(
        titleChars,
        { yPercent: 0, duration: 0.8, stagger: 0.03, ease: 'power3.out' },
        HERO_TITLE_DELAY,
      );

      tl.to(
        taglineEl,
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
        HERO_TAGLINE_DELAY,
      );
    };

    if (useScrollStore.getState().heroStartedAt != null) start();
    const unsub = useScrollStore.subscribe((s) => {
      if (s.heroStartedAt != null) start();
    });

    return () => {
      unsub();
      tl?.kill();
    };
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const apply = (progress: number) => {
      const t = Math.min(Math.max(progress / 0.035, 0), 1);
      const ty = 10 * t;
      const s = 1 - 0.3 * t;
      const rz = 15 * t;
      el.style.transform = `translate3d(0, ${ty}vw, 0) scale3d(${s}, ${s}, 1) rotateZ(${rz}deg)`;
    };

    apply(useScrollStore.getState().progress);
    return useScrollStore.subscribe((state) => {
      apply(state.progress);
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      id='hero'
      aria-labelledby='hero-h1'
      className='relative overflow-hidden h-[82svh] sm:h-[85svh] md:h-[100svh]'
    >
      <HeroBackground triggerRef={sectionRef} />
      <div
        data-avatar-anchor='hero'
        aria-hidden='true'
        className='pointer-events-none absolute left-1/2 top-[38svh] md:top-1/2 size-0'
      />
      <div
        ref={wrapperRef}
        className='relative flex flex-col items-center justify-start w-full h-full pt-[20svh] sm:pt-[18svh] md:pt-[10svh]'
        style={{ transformOrigin: '50% 50%' }}
      >
        {/* Upper block — cream fill, navy text, rotated +3deg */}
        <div
          ref={titleRef}
          aria-label={TITLE}
          className='text-quaternary inline-flex items-center justify-center overflow-hidden font-bold uppercase'
          style={{
            transform: 'rotate(0deg)',
            outlineOffset: 0,
            padding: '0 0.6em 0.1em',
            fontSize: 'clamp(1.75rem, min(7vw, 7svh), 8rem)',
            lineHeight: 1,
            letterSpacing: '-0.025em',
          }}
        >
          <MaskedChars text={TITLE} />
        </div>

        {/* Giant block — navy fill, cream text, amber outline, rotated -3deg */}
        <h1
          id='hero-h1'
          ref={nameRef}
          aria-label={NAME}
          className='bg-secondary text-primary inline-flex items-center justify-center overflow-hidden font-bold uppercase m-0'
          style={{
            transform: 'rotate(-3deg)',
            outline: '0.05em solid var(--color-primary)',
            outlineOffset: 0,
            padding: '0 0.15em 0.08em',
            fontSize: 'clamp(3rem, min(11vw, 11svh), 12rem)',
            lineHeight: 1,
            letterSpacing: '-0.025em',
          }}
        >
          <MaskedChars text={NAME} />
        </h1>

        {/* Tagline */}
        <p
          ref={taglineRef}
          className='mt-[4svh] max-w-2xl text-center text-base sm:text-lg leading-relaxed px-4'
          style={{
            color: 'color-mix(in srgb, var(--color-tertiary) 80%, transparent)',
          }}
        >
          {TAGLINE}
        </p>
      </div>
    </section>
  );
}
