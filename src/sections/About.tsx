import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const BODY =
  'Ich bin Frontend Software-Architekt mit Leidenschaft für saubere Architektur und modernen Code. Seit über 8 Jahren setze ich Angular-Anwendungen für Versicherungen, Telekommunikation, Einzelhandel und den öffentlichen Dienst um. Der Fokus lag hierbei meist auf Modularisierung, Micro-Frontends und der Migration von Legacy-Systemen zu Headless-Plattformen. Dank Fullstack-Kenntnissen kommuniziere ich auf Augenhöhe mit Backend-Teams und gestalte mit dem CI/CD durchgängige Workflows vom Commit bis zum Release. Ergänzt wird mein Profil durch fundierte Kenntnisse in KI-gestützter Entwicklung, mit denen ich die Projektumsetzung effizienter gestalte. Meine langjährige Erfahrung mit agilen Methoden und Scrum bringt zudem ein solides Verständnis für Prozesse, Qualität und agile Lieferung mit sich.';

const FACTS = [
  'Sprachkenntnisse — Arabisch (muttersprachlich) · Englisch (verhandlungssicher) · Deutsch (verhandlungssicher)',
  'Abschluss — 03/2014 B.Sc. Informatik, Amman (offiziell anerkannt in Deutschland)',
];

export function About() {
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
      className='relative h-[800px]'
    >
      {/* Amber background spans the full width; sits behind the canvas so the avatar + orbs stay in front */}
      <div aria-hidden='true' className='bg-quaternary absolute inset-0 -z-20' />

      <div className='relative h-full flex items-center' style={{ zIndex: 1 }}>
        <div
          className='text-primary'
          style={{
            marginLeft: '50vw',
            paddingLeft: 'clamp(1.5rem, 3vw, 3rem)',
            paddingRight: 'clamp(1.5rem, 6vw, 6rem)',
            paddingTop: 'clamp(4rem, 10vh, 8rem)',
            paddingBottom: 'clamp(4rem, 10vh, 8rem)',
            maxWidth: '50vw',
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
            Über mich
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
