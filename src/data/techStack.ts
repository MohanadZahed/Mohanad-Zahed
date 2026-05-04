export interface TechItem {
  id: string
  label: string
  texturePath: string
  yearsExperience: number
  color: string
}

// Logos currently present in public/textures/logos/.
// TODO: source missing primary-ring logos and rename to plain kebab-case:
//   rxjs.png, ngrx.png, tailwind.png, scss.png, sap-composable-storefront.png,
//   nodejs.png, nuxt.png. Then convert all to .ktx2 / .webp per asset-pipeline.md.
export const techStack: TechItem[] = [
  { id: 'angular', label: 'Angular', texturePath: '/textures/logos/angular.png', yearsExperience: 8, color: '#dd0031' },
  { id: 'typescript', label: 'TypeScript', texturePath: '/textures/logos/typescript.png', yearsExperience: 8, color: '#3178c6' },
  { id: 'react', label: 'React', texturePath: '/textures/logos/react_dark.png', yearsExperience: 3, color: '#61dafb' },
  { id: 'vue', label: 'Vue', texturePath: '/textures/logos/vue.png', yearsExperience: 2, color: '#42b883' },
  // Nx canonical is #143055 — too dark to read as a colored light, brighter variant below.
  { id: 'nx', label: 'Nx', texturePath: '/textures/logos/nx_dark.png', yearsExperience: 4, color: '#4f7eff' },
  { id: 'spring', label: 'Spring Boot', texturePath: '/textures/logos/spring.png', yearsExperience: 3, color: '#6db33f' },
  { id: 'javascript', label: 'JavaScript', texturePath: '/textures/logos/javascript.png', yearsExperience: 9, color: '#f7df1e' },
  { id: 'html5', label: 'HTML5', texturePath: '/textures/logos/html5.png', yearsExperience: 9, color: '#e34f26' },
  { id: 'css', label: 'CSS / SCSS', texturePath: '/textures/logos/css_old.png', yearsExperience: 9, color: '#1572b6' },
  { id: 'docker', label: 'Docker', texturePath: '/textures/logos/docker.png', yearsExperience: 4, color: '#2496ed' },
]
