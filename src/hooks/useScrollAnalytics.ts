import { useEffect } from 'react';
import { track } from '@vercel/analytics';
import { SECTION_IDS } from '../config/sections';
import { useScrollStore } from '../store/useScrollStore';

// Global scroll-depth thresholds (percent of the whole page) reported as custom
// events, so the dashboard shows a clean "how far did people get" funnel even if
// section names change later.
const DEPTH_MILESTONES = [25, 50, 75, 100] as const;

// Fraction of a section that must be visible before it counts as "reached".
const SECTION_VISIBLE_THRESHOLD = 0.4;

/**
 * Fires Vercel Web Analytics custom events for scroll behaviour. Two signals,
 * each guarded so it sends at most once per page load (keeps event volume to
 * ~4-8/visit, well inside the Hobby free quota):
 *
 *  - `section_view` { section } — the first time each section enters the
 *    viewport. More reliable than global-progress bands because the project's
 *    progress->section mapping is intentionally fuzzy (Skills' negative-margin
 *    overlap + variable Experience height).
 *  - `scroll_depth` { pct } — as global progress first crosses 25/50/75/100%.
 *
 * In dev, Vercel events are no-op/debug; they only land in production once Web
 * Analytics is enabled in the Vercel dashboard.
 */
export function useScrollAnalytics() {
  useEffect(() => {
    // --- Section reached -----------------------------------------------------
    const seenSections = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).id;
          if (!id || seenSections.has(id)) continue;
          seenSections.add(id);
          track('section_view', { section: id });
        }
      },
      { threshold: SECTION_VISIBLE_THRESHOLD },
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // --- Depth milestones ---------------------------------------------------
    const seenDepths = new Set<number>();
    const unsubscribe = useScrollStore.subscribe((state) => {
      const pct = state.progress * 100;
      for (const milestone of DEPTH_MILESTONES) {
        if (pct >= milestone && !seenDepths.has(milestone)) {
          seenDepths.add(milestone);
          track('scroll_depth', { pct: milestone });
        }
      }
    });

    return () => {
      observer.disconnect();
      unsubscribe();
    };
  }, []);
}
