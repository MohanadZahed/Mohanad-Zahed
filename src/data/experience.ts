export interface ExperienceProject {
  id: string;
  dateLabel: string;
  customer: string;
  teamSize: string;
  stack: string[];
  link?: string;
}

export interface ExperienceCompany {
  id: string;
  projects: ExperienceProject[];
}

const STEP: ExperienceProject = {
  id: 'step',
  dateLabel: '11/2025 – 02/2026',
  customer: 'Bundesagentur für Arbeit, Nürnberg',
  teamSize: '12 / 80',
  stack: [
    'Scrum', 'Agile', 'Spring Boot', 'Java', 'Maven', 'Micro Services', 'Kafka',
    'Oracle SQL', 'Docker', 'OpenAPI', 'Swagger', 'Angular 20', 'NgRx',
    'TypeScript', 'HTML', 'SCSS', 'GitLab CI/CD', 'Git', 'REST', 'JWT',
    'Jasmine/Karma', 'Selenium', 'Silk Central', 'Code Analyse', 'CleanCode',
    'Jira', 'Confluence',
  ],
};

const SVLFG: ExperienceProject = {
  id: 'svlfg',
  dateLabel: '03/2024 – 06/2025',
  customer: 'Sozialversicherung für Landwirtschaft, Forsten und Gartenbau, Kassel',
  teamSize: '8 / 14',
  stack: [
    'Scrum', 'Agile', 'Docker', 'Migration', 'OpenAPI', 'E-Commerce', 'Spring Boot',
    'Java', 'SAP Hybris', 'SAP Commerce', 'SAP Composable Storefront', 'Angular 19',
    'NgRx', 'TypeScript', 'Nx', 'HTML', 'SCSS', 'GitLab CI/CD', 'Git', 'REST',
    'JWT', 'OAuth 2', 'Jasmine/Karma', 'Cypress', 'Software-Architektur',
    'Refactoring', 'Code Analyse', 'CleanCode', 'Jira', 'Confluence',
  ],
};

const MOBILCOM: ExperienceProject = {
  id: 'mobilcom-ecare',
  dateLabel: '10/2023 – 02/2024',
  customer: 'Freenet AG, Büdelsdorf',
  teamSize: '8 / 15',
  stack: [
    'Scrum', 'Agile', 'GraphQL', 'Angular 18', 'TypeScript', 'Nx', 'HTML', 'SCSS',
    'GitHub CI/CD', 'Git', 'Jasmine/Karma', 'Cypress', 'Software-Architektur',
    'CleanCode', 'Jira', 'Confluence',
  ],
};

const EMPORIX: ExperienceProject = {
  id: 'emporix',
  dateLabel: '09/2023 – 10/2023',
  customer: 'Medienwerft GmbH, Hamburg',
  teamSize: '4 / 7',
  stack: [
    'Kanban', 'E-Commerce', 'OpenAPI', 'Spring Boot', 'Java', 'Emporix', 'Alokai',
    'Nuxt', 'TypeScript', 'GitLab CI/CD', 'Git', 'REST', 'JWT', 'CleanCode',
    'Jira', 'Confluence',
  ],
};

const HABA: ExperienceProject = {
  id: 'haba',
  dateLabel: '07/2023 – 09/2023',
  customer: 'HABA FAMILYGROUP, Bad Rodach',
  teamSize: '2 / 8',
  stack: [
    'Spring Boot', 'Java', 'E-Commerce', 'CMS', 'SAP Hybris', 'SAP Commerce',
    'SAP Composable Storefront', 'Angular 16', 'NgRx', 'TypeScript', 'HTML',
    'SCSS', 'GitLab', 'Git', 'OpenAPI', 'REST', 'JWT', 'OAuth 2', 'Jasmine/Karma',
    'Software-Architektur', 'Refactoring', 'Code Analyse', 'CleanCode',
  ],
};

const OTTOS: ExperienceProject = {
  id: 'ottos-sherpa',
  dateLabel: '10/2022 – 07/2023',
  customer: 'Otto’s AG und Sherpa Outdoor, Zürich',
  teamSize: '12 / 20',
  stack: [
    'Scrum', 'Agile', 'Migration', 'OpenAPI', 'E-Commerce', 'CMS', 'Spring Boot',
    'Java', 'SAP Hybris', 'SAP Commerce', 'SAP Composable Storefront',
    'Angular 16', 'NgRx', 'TypeScript', 'HTML', 'SCSS', 'GitLab CI/CD', 'Git',
    'REST', 'JWT', 'OAuth 2', 'Jasmine/Karma', 'Cypress',
    'Code Review Techniken', 'CleanCode', 'Jira', 'Confluence',
  ],
};

const LANDGARD: ExperienceProject = {
  id: 'landgard',
  dateLabel: '05/2021 – 09/2022',
  customer: 'Landgard eG, Staelen-Herongen',
  teamSize: '6 / 10',
  stack: [
    'Scrum', 'Agile', 'OpenAPI', 'E-Commerce', 'CMS', 'Spring Boot', 'Java',
    'SAP Hybris', 'SAP Commerce', 'SAP Composable Storefront', 'Angular 15',
    'NgRx', 'TypeScript', 'HTML', 'SCSS', 'GitLab', 'Git', 'REST', 'JWT',
    'OAuth 2', 'CleanCode', 'Jira', 'Confluence',
  ],
};

const SPAR: ExperienceProject = {
  id: 'spar',
  dateLabel: '11/2020 – 04/2021',
  customer: 'SPAR, Wien',
  teamSize: '8 / 25',
  stack: [
    'Scrum', 'Agile', 'E-Commerce', 'CMS', 'Spring Boot', 'Java', 'SAP Hybris',
    'SAP Commerce', 'JSP', 'JavaScript', 'HTML', 'Less', 'GitLab', 'Git',
    'Barrierefreiheit', 'CleanCode', 'Jira', 'Confluence',
  ],
};

const DAW: ExperienceProject = {
  id: 'daw',
  dateLabel: '01/2020 – 12/2020',
  customer: 'DAW SE, Ober-Ramstadt',
  teamSize: '8 / 16',
  stack: [
    'Scrum', 'Agile', 'E-Commerce', 'CMS', 'Spring Boot', 'Java', 'SAP Hybris',
    'SAP Commerce', 'JSP', 'JavaScript', 'HTML', 'Less', 'Bitbucket', 'Git',
    'Jira', 'Confluence',
  ],
};

const DACHDECKER: ExperienceProject = {
  id: 'dachdecker',
  dateLabel: '08/2019 – 01/2020',
  customer: 'Dachdecker-Einkauf Süd eG, Mannheim',
  teamSize: '5 / 8',
  stack: [
    'Scrum', 'Agile', 'E-Commerce', 'CMS', 'Spring Boot', 'Java', 'SAP Hybris',
    'SAP Commerce', 'JSP', 'JavaScript', 'HTML', 'Less', 'Bitbucket', 'Git',
    'Jira', 'Confluence',
  ],
};

const FROSTA: ExperienceProject = {
  id: 'frosta',
  dateLabel: '01/2019 – 08/2019',
  customer: 'FRoSTA AG, Bremerhaven',
  teamSize: '5 / 3',
  stack: [
    'Android', 'Angular 6', 'Angular Material', 'SPA', 'Sass', 'HTML',
    'TypeScript', 'J2EE', 'JAX-RS', 'JDBC', 'Apache HTTP Server',
    'Microsoft SQL Server', 'REST', 'JWT', 'OpenAPI', 'Swagger', 'OOP',
    'Software-Architektur', 'Systemarchitektur', 'Git', 'GitLab', 'Postman',
  ],
};

const LSW: ExperienceProject = {
  id: 'lsw',
  dateLabel: '01/2018 – 12/2018',
  customer: 'LSW Netz GmbH & Co. KG, Wolfsburg',
  teamSize: '5 / 3',
  stack: [
    'Ionic', 'SPA', 'Sass', 'HTML', 'JavaScript', 'TypeScript', 'J2EE', 'JAX-RS',
    'JDBC', 'Apache HTTP Server', 'Microsoft SQL Server', 'REST', 'OOP', 'Git',
    'GitLab', 'Postman', 'SAP Java Connector',
  ],
};

export const EXPERIENCE: readonly ExperienceCompany[] = [
  {
    id: 'iso-gruppe',
    projects: [STEP],
  },
  {
    id: 'medienwerft',
    projects: [SVLFG, MOBILCOM, EMPORIX, HABA, OTTOS, LANDGARD, SPAR, DAW, DACHDECKER],
  },
  {
    id: 'merentis',
    projects: [FROSTA, LSW],
  },
];
