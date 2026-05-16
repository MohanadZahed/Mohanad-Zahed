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
      aria-labelledby='about-h2'
      className='relative min-h-200 min-[900px]:h-200'
    >
      {/* Amber background spans the full width; sits behind the canvas so the avatar + orbs stay in front */}
      <div aria-hidden='true' className='bg-quaternary absolute inset-0 -z-20' />

      <div className='relative min-h-full flex items-center' style={{ zIndex: 1 }}>
        <div
          className='text-primary w-full max-w-full min-[900px]:ml-[50vw] min-[900px]:max-w-[50vw]'
          style={{
            paddingLeft: 'clamp(1.5rem, 3vw, 3rem)',
            paddingRight: 'clamp(1.5rem, 6vw, 6rem)',
            paddingTop: 'clamp(4rem, 10vh, 8rem)',
            paddingBottom: 'clamp(4rem, 10vh, 8rem)',
          }}
        >
          <h2
            id='about-h2'
            ref={headlineRef}
            className='font-bold uppercase'
            style={{
              fontSize: 'clamp(2rem, 5vw, 4.5rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.05vw',
            }}
          >
            {t('about.heading')}
          </h2>

          <p
            ref={bodyRef}
            className='mt-8 leading-relaxed'
            style={{ fontSize: 'clamp(0.95rem, 1.05vw, 1.125rem)' }}
          >
            {BODY}
          </p>

          <ul ref={factsRef} className='mt-8 space-y-3'>
            {FACTS.map((fact) => (
              <li
                key={fact}
                className='flex gap-3 leading-relaxed'
                style={{ fontSize: 'clamp(0.85rem, 0.95vw, 1rem)' }}
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
