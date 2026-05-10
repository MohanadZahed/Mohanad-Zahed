export type KnowledgeCategory = 'methodology' | 'architecture' | 'process' | 'soft';

export interface KnowledgeItem {
  id: string;
  label: string;
  category: KnowledgeCategory;
}

export const KNOWLEDGE: readonly KnowledgeItem[] = [
  { id: 'agile', label: 'Agile', category: 'methodology' },
  { id: 'scrum', label: 'Scrum', category: 'methodology' },
  { id: 'kanban', label: 'Kanban', category: 'methodology' },
  { id: 'bdd', label: 'BDD', category: 'methodology' },
  { id: 'shift-left', label: 'Shift-left Testing', category: 'methodology' },
  { id: 'trunk-based', label: 'Trunk-based Dev', category: 'methodology' },

  { id: 'micro-frontends', label: 'Micro-frontends', category: 'architecture' },
  { id: 'headless-commerce', label: 'Headless Commerce', category: 'architecture' },
  { id: 'clean-architecture', label: 'Clean Architecture', category: 'architecture' },
  { id: 'solid', label: 'SOLID', category: 'architecture' },
  { id: 'nx-monorepos', label: 'Nx Monorepos', category: 'architecture' },
  { id: 'design-systems', label: 'Design Systems', category: 'architecture' },

  { id: 'cicd-ownership', label: 'CI/CD Ownership', category: 'process' },
  { id: 'code-reviews', label: 'Code Reviews', category: 'process' },
  { id: 'refactoring', label: 'Refactoring', category: 'process' },
  { id: 'wcag', label: 'WCAG / a11y', category: 'process' },
  { id: 'release-mgmt', label: 'Release Mgmt', category: 'process' },

  { id: 'tech-leadership', label: 'Technical Leadership', category: 'soft' },
  { id: 'mentoring', label: 'Mentoring', category: 'soft' },
  { id: 'knowledge-transfer', label: 'Knowledge Transfer', category: 'soft' },
  { id: 'ai-augmented', label: 'AI-augmented Dev', category: 'soft' },
  { id: 'stakeholder-mgmt', label: 'Stakeholder Mgmt', category: 'soft' },
] as const;

export const KNOWLEDGE_CATEGORY_COLOR: Record<KnowledgeCategory, string> = {
  methodology: '#a78bfa',
  architecture: '#38bdf8',
  process: '#34d399',
  soft: '#f59e0b',
};
