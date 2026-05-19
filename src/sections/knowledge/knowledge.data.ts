export type KnowledgeCategory = 'methodology' | 'architecture' | 'process' | 'soft';

export interface KnowledgeItem {
  id: string;
  label: string;
  category: KnowledgeCategory;
  // Optional per-bubble pixel offsets, added to the auto-computed ring
  // position. Use to nudge individual bubbles when the layout needs hand-tuning.
  // Applied on viewports ≥ 768px (ellipse layout).
  x?: number;
  y?: number;
  // Per-bubble pixel offsets that apply *only* on viewports ≤ 767px
  // (square-perimeter layout). When set, these replace x/y on mobile.
  mobileOffsets?: {
    x?: number;
    y?: number;
  };
}

export const KNOWLEDGE: readonly KnowledgeItem[] = [
  {
    id: 'shift-left',
    label: 'Shift-left Testing',
    category: 'methodology',
    mobileOffsets: { x: 20, y: -30 },
  },
  {
    id: 'trunk-based',
    label: 'Trunk-based Dev',
    category: 'methodology',
    mobileOffsets: { x: -1, y: 15 },
  },

  { id: 'micro-frontends', label: 'Micro-frontends', category: 'architecture' },
  { id: 'bdd', label: 'BDD', category: 'methodology' },

  { id: 'solid', label: 'SOLID', category: 'architecture' },

  { id: 'scrum', label: 'Scrum', category: 'methodology' },
  { id: 'headless-commerce', label: 'Headless Commerce', category: 'architecture' },

  {
    id: 'clean-architecture',
    label: 'Clean Architecture',
    category: 'architecture',
    mobileOffsets: { x: 10, y: 25 },
  },

  {
    id: 'knowledge-transfer',
    label: 'Knowledge Transfer',
    category: 'soft',
    mobileOffsets: { x: -10, y: 25 },
  },
  {
    id: 'monorepos',
    label: 'Monorepos',
    category: 'architecture',
    mobileOffsets: { x: -25, y: 25 },
  },
  {
    id: 'design-systems',
    label: 'Design Systems',
    category: 'architecture',
    mobileOffsets: { x: -1, y: -15 },
  },

  { id: 'code-reviews', label: 'Code Reviews', category: 'process' },
  { id: 'refactoring', label: 'Refactoring', category: 'process' },
  { id: 'wcag', label: 'WCAG / a11y', category: 'process' },
  { id: 'release-mgmt', label: 'Release Mgmt', category: 'process' },

  { id: 'agile', label: 'Agile', category: 'methodology' },
  {
    id: 'tech-leadership',
    label: 'Technical Leadership',
    category: 'soft',
    mobileOffsets: { x: -10, y: -25 },
  },
  { id: 'mentoring', label: 'Mentoring', category: 'soft', mobileOffsets: { x: 5, y: -30 } },
] as const;

export const KNOWLEDGE_CATEGORY_COLOR: Record<KnowledgeCategory, string> = {
  methodology: '#a78bfa',
  architecture: '#38bdf8',
  process: '#34d399',
  soft: '#f59e0b',
};
