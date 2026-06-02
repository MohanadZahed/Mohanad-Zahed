import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useT } from '../i18n/useT';

export function About() {
  const { t, tArray } = useT();
  const BODY = t('about.body');
  const FACTS = tArray('about.facts');
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const factsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const headline = headlineRef.current;
    const body = bodyRef.current;
    const facts = factsRef.current;
    if (!section || !headline || !body || !facts) return;

    const items = [headline, body, ...Array.from(facts.children)] as HTMLElement[];

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
      id='about'
      aria-labelledby='about-h2'
      className='relative min-h-200 min-[900px]:h-200'
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

      <div className='bg-secondary relative min-h-full flex items-center' style={{ zIndex: -11 }}>
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
            ref={headlineRef}
            className='font-bold uppercase'
            style={{
              fontSize: 'clamp(2.75rem, 7vw, 5.5rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.05vw',
            }}
          >
            {t('about.heading')}
          </h2>

          <p
            ref={bodyRef}
            className='mt-6 leading-relaxed sm:mt-8'
            style={{ fontSize: 'clamp(0.95rem, 1.05vw, 1.125rem)' }}
          >
            {BODY}
          </p>

          <ul ref={factsRef} className='mt-6 space-y-3 sm:mt-8'>
            {FACTS.map((fact) => (
              <li
                key={fact}
                className='flex gap-3 leading-relaxed'
                style={{ fontSize: 'clamp(0.9rem, 0.95vw, 1rem)' }}
              >
                <span aria-hidden='true' className='select-none font-bold'>
                  ›
                </span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
