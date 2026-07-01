import { useEffect } from 'react';
import { getLenis } from './useLenis';
import { NAV_SECTION_IDS, type NavSectionId } from '../config/sections';
import { useScrollStore } from '../store/useScrollStore';
import { SKILLS_HASH_FILL } from '../sections/skills/skills.constants';

function isSectionId(value: string): value is NavSectionId {
  return (NAV_SECTION_IDS as readonly string[]).includes(value);
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
    let currentId: NavSectionId | '' =
      initialHash && isSectionId(initialHash) ? initialHash : '';

    // Skills' section box carries a large negative marginTop, so it crosses the
    // viewport's middle band (and would win the hash) long before its emerge/zoom
    // fills the screen. Gate it on the section-local `skillsIntro` reaching the
    // fill threshold, so the hash only flips to #Skills once it actually fills the
    // viewport — until then Manifesto (still pinned/on-screen) keeps the hash.
    let skillsFilled =
      useScrollStore.getState().skillsIntro >= SKILLS_HASH_FILL;

    const isPresent = (id: NavSectionId) =>
      intersecting.has(id) && (id !== 'Skills' || skillsFilled);

    const resolve = () => {
      // Prefer the latest section in document order when overlap occurs
      // (e.g. Skills' negative margin makes it overlap Manifesto on entry).
      let next: NavSectionId | '' = '';
      for (let i = NAV_SECTION_IDS.length - 1; i >= 0; i--) {
        if (isPresent(NAV_SECTION_IDS[i])) {
          next = NAV_SECTION_IDS[i];
          break;
        }
      }

      if (next !== currentId) {
        currentId = next;
        if (next) {
          const newHash = `#${next}`;
          if (window.location.hash !== newHash) {
            history.replaceState(null, '', newHash);
          }
        } else if (window.location.hash) {
          // Scrolled back up to the hero — clear the hash for a clean URL.
          history.replaceState(
            null,
            '',
            window.location.pathname + window.location.search,
          );
        }
      }
    };

    const onIntersect = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).id;
        if (!id) continue;
        if (entry.isIntersecting) intersecting.add(id);
        else intersecting.delete(id);
      }
      resolve();
    };

    const observer = new IntersectionObserver(onIntersect, {
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0,
    });

    NAV_SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // Re-resolve when Skills crosses the fill threshold (both directions). Fires
    // on every store write (no subscribeWithSelector), so early-return unless the
    // boolean actually flipped — a cheap compare against per-frame progress ticks.
    const unsubscribe = useScrollStore.subscribe((state) => {
      const filled = state.skillsIntro >= SKILLS_HASH_FILL;
      if (filled === skillsFilled) return;
      skillsFilled = filled;
      resolve();
    });

    return () => {
      observer.disconnect();
      unsubscribe();
    };
  }, []);
}
