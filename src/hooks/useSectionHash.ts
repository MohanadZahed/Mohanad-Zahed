import { useEffect } from 'react';
import { getLenis } from './useLenis';

const SECTION_IDS = [
  'hero',
  'about',
  'manifesto',
  'skills',
  'knowledge',
  'certificates',
  'experience',
  'contact',
] as const;

type SectionId = (typeof SECTION_IDS)[number];

function isSectionId(value: string): value is SectionId {
  return (SECTION_IDS as readonly string[]).includes(value);
}

export function useSectionHash() {
  useEffect(() => {
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && isSectionId(initialHash)) {
      const scroll = () => {
        const el = document.getElementById(initialHash);
        if (!el) return;
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(el, { immediate: true });
        else el.scrollIntoView();
      };
      requestAnimationFrame(() => requestAnimationFrame(scroll));
    }

    const intersecting = new Set<string>();
    let currentId: SectionId | '' =
      initialHash && isSectionId(initialHash) ? initialHash : '';

    const onIntersect = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).id;
        if (!id) continue;
        if (entry.isIntersecting) intersecting.add(id);
        else intersecting.delete(id);
      }

      // Prefer the latest section in document order when overlap occurs
      // (e.g. Skills' negative margin makes it overlap Manifesto on entry).
      let next: SectionId | '' = '';
      for (let i = SECTION_IDS.length - 1; i >= 0; i--) {
        if (intersecting.has(SECTION_IDS[i])) {
          next = SECTION_IDS[i];
          break;
        }
      }

      if (next && next !== currentId) {
        currentId = next;
        const newHash = `#${next}`;
        if (window.location.hash !== newHash) {
          history.replaceState(null, '', newHash);
        }
      }
    };

    const observer = new IntersectionObserver(onIntersect, {
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0,
    });

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);
}
