export type SkillCategory = 'frontend' | 'backend' | 'ai' | 'devops';
export type SkillSize = 'sm' | 'md' | 'lg';

export interface Skill {
  id: string;
  label: string;
  category: SkillCategory;
  level: number;
  size: SkillSize;
}

export const skills: Skill[] = [
  // Frontend
  { id: 'angular', label: 'Angular', category: 'frontend', level: 95, size: 'lg' },
  { id: 'typescript', label: 'TypeScript', category: 'frontend', level: 92, size: 'lg' },
  { id: 'javascript', label: 'JavaScript', category: 'frontend', level: 90, size: 'md' },
  { id: 'react', label: 'React', category: 'frontend', level: 70, size: 'md' },
  { id: 'vue3', label: 'Vue 3', category: 'frontend', level: 55, size: 'md' },
  { id: 'nuxt3', label: 'Nuxt 3', category: 'frontend', level: 50, size: 'sm' },
  { id: 'rxjs', label: 'RxJS', category: 'frontend', level: 85, size: 'md' },
  { id: 'ngrx', label: 'NgRx', category: 'frontend', level: 80, size: 'md' },
  { id: 'nx', label: 'Nx', category: 'frontend', level: 78, size: 'sm' },
  { id: 'scss', label: 'SCSS', category: 'frontend', level: 88, size: 'sm' },
  { id: 'css', label: 'CSS', category: 'frontend', level: 90, size: 'sm' },
  { id: 'tailwind', label: 'Tailwind CSS', category: 'frontend', level: 75, size: 'md' },
  { id: 'html', label: 'HTML', category: 'frontend', level: 95, size: 'sm' },
  { id: 'bootstrap', label: 'Bootstrap', category: 'frontend', level: 65, size: 'sm' },
  { id: 'jquery', label: 'jQuery', category: 'frontend', level: 60, size: 'sm' },
  { id: 'jsp', label: 'JSP', category: 'frontend', level: 55, size: 'sm' },
  { id: 'spartacus', label: 'SAP Composable', category: 'frontend', level: 82, size: 'lg' },
  { id: 'web-components', label: 'Web Components', category: 'frontend', level: 60, size: 'md' },
  { id: 'storybook', label: 'Storybook', category: 'frontend', level: 65, size: 'sm' },
  { id: 'cypress', label: 'Cypress', category: 'frontend', level: 70, size: 'sm' },
  { id: 'jasmine', label: 'Jasmine', category: 'frontend', level: 75, size: 'sm' },
  { id: 'ionic', label: 'Ionic', category: 'frontend', level: 45, size: 'sm' },
  { id: 'android', label: 'Android Native', category: 'frontend', level: 35, size: 'md' },
  { id: 'xamarin', label: 'Xamarin', category: 'frontend', level: 25, size: 'sm' },
  { id: 'pwa', label: 'PWA', category: 'frontend', level: 60, size: 'sm' },

  // Backend
  { id: 'java', label: 'Java', category: 'backend', level: 70, size: 'md' },
  { id: 'spring-boot', label: 'Spring Boot', category: 'backend', level: 65, size: 'md' },
  { id: 'nodejs', label: 'Node.js', category: 'backend', level: 60, size: 'sm' },
  { id: 'jax-rs', label: 'JAX-RS', category: 'backend', level: 50, size: 'sm' },
  { id: 'sql-server', label: 'SQL Server', category: 'backend', level: 55, size: 'sm' },
  { id: 'dotnet', label: '.NET / C#', category: 'backend', level: 40, size: 'sm' },
  { id: 'solidity', label: 'Solidity', category: 'backend', level: 25, size: 'sm' },
  { id: 'kafka', label: 'Kafka', category: 'backend', level: 55, size: 'md' },
  { id: 'rest', label: 'REST', category: 'backend', level: 90, size: 'sm' },
  { id: 'graphql', label: 'GraphQL', category: 'backend', level: 70, size: 'sm' },
  { id: 'web-sockets', label: 'Web Sockets', category: 'backend', level: 55, size: 'sm' },

  // AI
  { id: 'claude-code', label: 'Claude Code', category: 'ai', level: 85, size: 'lg' },
  { id: 'prompt-eng', label: 'Prompt Engineering', category: 'ai', level: 80, size: 'md' },
  { id: 'llm-integration', label: 'LLM Integration', category: 'ai', level: 70, size: 'md' },
  { id: 'gemini', label: 'Gemini', category: 'ai', level: 55, size: 'sm' },
  { id: 'chatgpt', label: 'ChatGPT', category: 'ai', level: 75, size: 'sm' },
  { id: 'copilot', label: 'Copilot', category: 'ai', level: 70, size: 'sm' },

  // DevOps
  { id: 'git', label: 'Git', category: 'devops', level: 92, size: 'sm' },
  { id: 'gitlab', label: 'GitLab', category: 'devops', level: 80, size: 'sm' },
  { id: 'github-actions', label: 'GitHub Actions', category: 'devops', level: 70, size: 'md' },
  { id: 'cicd', label: 'CI/CD', category: 'devops', level: 78, size: 'md' },
  { id: 'docker', label: 'Docker', category: 'devops', level: 65, size: 'md' },
  { id: 'aws-ec2', label: 'AWS EC2', category: 'devops', level: 50, size: 'sm' },
  { id: 'sap-commerce', label: 'SAP Commerce', category: 'devops', level: 70, size: 'md' },
];
