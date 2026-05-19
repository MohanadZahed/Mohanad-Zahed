export type KnowledgeCategory = 'methodology' | 'architecture' | 'process' | 'soft';

export interface KnowledgeItem {
  id: string;
  label: string;
  category: KnowledgeCategory;
  // Optional per-bubble pixel offsets, added to the auto-computed ring
  // position. Use to nudge individual bubbles when the layout needs hand-tuning.
  x?: number;
  y?: number;
}

export const KNOWLEDGE: readonly KnowledgeItem[] = [
  { id: 'agile', label: 'Agile', category: 'methodology' },
  { id: 'scrum', label: 'Scrum', category: 'methodology' },
  { id: 'bdd', label: 'BDD', category: 'methodology' },
  { id: 'shift-left', label: 'Shift-left Testing', category: 'methodology' },
  { id: 'trunk-based', label: 'Trunk-based Dev', category: 'methodology' },

  { id: 'micro-frontends', label: 'Micro-frontends', category: 'architecture' },
  { id: 'headless-commerce', label: 'Headless Commerce', category: 'architecture' },
  { id: 'clean-architecture', label: 'Clean Architecture', category: 'architecture' },
  { id: 'solid', label: 'SOLID', category: 'architecture', x: 20 },
  { id: 'monorepos', label: 'Monorepos', category: 'architecture', x: 20 },
  { id: 'design-systems', label: 'Design Systems', category: 'architecture' },

  { id: 'code-reviews', label: 'Code Reviews', category: 'process' },
  { id: 'refactoring', label: 'Refactoring', category: 'process' },
  { id: 'wcag', label: 'WCAG / a11y', category: 'process' },
  { id: 'release-mgmt', label: 'Release Mgmt', category: 'process' },

  { id: 'tech-leadership', label: 'Technical Leadership', category: 'soft' },
  { id: 'mentoring', label: 'Mentoring', category: 'soft' },
  { id: 'knowledge-transfer', label: 'Knowledge Transfer', category: 'soft' },
] as const;

export const KNOWLEDGE_CATEGORY_COLOR: Record<KnowledgeCategory, string> = {
  methodology: '#a78bfa',
  architecture: '#38bdf8',
  process: '#34d399',
  soft: '#f59e0b',
};
