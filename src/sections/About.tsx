import { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useT } from '../i18n/useT';
import { useFitText } from '../hooks/useFitText';

// Soft-wave reveal tuning: REST_ALPHA is the dim gray each word rests at; WAVE_SOFTNESS
// is how many words are mid-transition at once (the width of the gray→black sweep edge).
const REST_ALPHA = 0.3;
const WAVE_SOFTNESS = 4;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

// Paint a list of word spans gray→black for a 0..1 scroll progress, with a soft
// overlapping edge (several words mid-transition at once) sweeping left→right.
const paintWave = (words: HTMLElement[], p: number) => {
  const N = words.length;
  for (let i = 0; i < N; i++) {
    const local = clamp01((p * (N + WAVE_SOFTNESS) - i) / WAVE_SOFTNESS);
    const alpha = REST_ALPHA + (1 - REST_ALPHA) * local;
    words[i].style.color = `rgba(0, 0, 0, ${alpha})`;
  }
};

export function About() {
  const { t, tArray } = useT();
  const BODY = t('about.body');
  const FACTS = tArray('about.facts');
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const factsRef = useRef<HTMLUListElement>(null);
  const WORDS = BODY.split(' ');

  // Keep the heading on one line: shrink the font to fit, sharing the element
  // with the existing wave-animation ref.
  const fitHeadline = useFitText<HTMLHeadingElement>({ text: t('about.heading') });
  const setHeadlineRef = useCallback(
    (el: HTMLHeadingElement | null) => {
      headlineRef.current = el;
      fitHeadline(el);
    },
    [fitHeadline],
  );

  // Body paragraph: scroll-scrubbed gray→black soft wave, fully dark by the time
  // the paragraph's top reaches 40% up from the viewport bottom. Words are painted
  // by direct DOM writes (no React re-render). Re-runs on locale change (BODY dep).
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const words = Array.from(body.children) as HTMLElement[];
    if (words.length === 0) return;

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (const el of words) el.style.color = '';
      return;
    }

    paintWave(words, 0);

    const trigger = ScrollTrigger.create({
      trigger: body,
      start: 'top bottom-=15%',
      end: 'top 60%',
      scrub: true,
      onUpdate: (self) => paintWave(words, self.progress),
    });

    return () => trigger.kill();
  }, [BODY]);

  // Facts list: same scroll-scrubbed gray→black soft wave as the body, sweeping
  // across all words (and the `›` markers) of every fact in document order.
  useEffect(() => {
    const facts = factsRef.current;
    if (!facts) return;
    const words = Array.from(facts.querySelectorAll<HTMLElement>('[data-reveal-word]'));
    if (words.length === 0) return;

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (const el of words) el.style.color = '';
      return;
    }

    paintWave(words, 0);

    const trigger = ScrollTrigger.create({
      trigger: facts,
      start: 'top bottom-=15%',
      end: 'top 60%',
      scrub: true,
      onUpdate: (self) => paintWave(words, self.progress),
    });

    return () => trigger.kill();
  }, [FACTS]);

  useEffect(() => {
    const section = sectionRef.current;
    const headline = headlineRef.current;
    if (!section || !headline) return;

    const items = [headline] as HTMLElement[];

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(items, { opacity: 0, y: 30 });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 1.0,
            stagger: 0.12,
            ease: 'power3.out',
          });
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id='About'
      aria-labelledby='about-h2'
      className='relative min-h-167 min-[900px]:h-200'
    >
      {/* Amber background spans the full width; sits behind the canvas so the avatar + orbs stay in front */}
      <div aria-hidden='true' className='absolute inset-0 -z-20' />

      {/* Avatar landing spot: the 3D scene measures this element's bounding rect
          and projects it into world space. Position it with CSS — no per-breakpoint
          world coordinates needed. ≥900px: centered in the empty left half-column.
          <900px: sits in the gutter to the right of the heading. */}
      <div
        data-avatar-anchor='about'
        aria-hidden='true'
        className='pointer-events-none absolute size-0  right-[26%] min-[900px]:top-1/3 min-[900px]:left-1/4 min-[900px]:right-auto'
      />

      <div
        className='bg-secondary relative min-h-full flex items-center [clip-path:polygon(0px_0px,100%_0px,100%_89%,57.5%_89%,40%_100%,0px_100%)] min-[900px]:[clip-path:polygon(0px_0px,100%_0px,100%_89%,35%_89%,27%_100%,0px_100%)]'
        style={{
          zIndex: -11,
          backgroundImage: 'url(/textures/texture1.jpg)',
          backgroundRepeat: 'repeat',
        }}
      >
        <div
          className='text-primary w-full max-w-full min-[900px]:ml-[50vw] min-[900px]:max-w-[50vw]'
          style={{
            paddingLeft: 'clamp(1.25rem, 5vw, 3rem)',
            paddingRight: 'clamp(1.25rem, 5vw, 6rem)',
            paddingTop: 'clamp(3rem, 10svh, 8rem)',
            paddingBottom: 'clamp(3rem, 10svh, 8rem)',
          }}
        >
          <h2
            id='about-h2'
            ref={setHeadlineRef}
            className='font-bold uppercase'
            style={{
              lineHeight: 1.05,
              letterSpacing: '-0.05vw',
            }}
          >
            {t('about.heading')}
          </h2>

          <p
            ref={bodyRef}
            className='mt-6 leading-relaxed sm:mt-8'
            style={{ fontSize: 'clamp(0.95rem, 1.1vw, 1.2rem)' }}
          >
            {WORDS.map((word, i) => (
              <span key={`${word}-${i}`} style={{ color: `rgba(0, 0, 0, ${REST_ALPHA})` }}>
                {word}
                {i < WORDS.length - 1 ? ' ' : ''}
              </span>
            ))}
          </p>

          <ul ref={factsRef} className='mt-6 space-y-3 sm:mt-8'>
            {FACTS.map((fact) => {
              const factWords = fact.split(' ');
              return (
                <li
                  key={fact}
                  className='flex gap-3 leading-relaxed'
                  style={{ fontSize: 'clamp(0.9rem, 0.95vw, 1rem)' }}
                >
                  <span
                    aria-hidden='true'
                    data-reveal-word
                    className='select-none font-bold'
                    style={{ color: `rgba(0, 0, 0, ${REST_ALPHA})` }}
                  >
                    ›
                  </span>
                  <span>
                    {factWords.map((word, i) => (
                      <span
                        key={`${word}-${i}`}
                        data-reveal-word
                        style={{ color: `rgba(0, 0, 0, ${REST_ALPHA})` }}
                      >
                        {word}
                        {i < factWords.length - 1 ? ' ' : ''}
                      </span>
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
