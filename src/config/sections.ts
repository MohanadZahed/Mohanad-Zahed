// Canonical section ids, top-to-bottom — matches the `<section id="...">` markup
// and the render order in App.tsx. Shared by analytics (all sections) and the
// hash-nav hook (which excludes Hero so the top of the page has a clean URL).

export const SECTION_IDS = [
  'Hero',
  'About',
  'Manifesto',
  'Skills',
  'Knowledge',
  'Certificates',
  'Experience',
  'Contact',
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

// Hash-nav targets: Hero is excluded so scrolling back to the top yields a
// clean, hash-free URL (see useSectionHash).
export type NavSectionId = Exclude<SectionId, 'Hero'>;

export const NAV_SECTION_IDS = SECTION_IDS.filter(
  (id): id is NavSectionId => id !== 'Hero',
);
