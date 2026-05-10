export interface ExperienceProject {
  id: string;
  role: string;
  name: string;
  dateLabel: string;
  customer: string;
  industry: string;
  teamSize: string;
  stack: string[];
  description: string;
  tasks: string[];
  link?: string;
}

export interface ExperienceCompany {
  id: string;
  name: string;
  role: string;
  city: string;
  timeline: string;
  projects: ExperienceProject[];
}

const STEP: ExperienceProject = {
  id: 'step',
  role: 'Fullstack Entwickler',
  name: 'STEP — Stammdatenerfassungs- und pflegesystem',
  dateLabel: '11/2025 – 02/2026',
  customer: 'Bundesagentur für Arbeit, Nürnberg',
  industry: 'Öffentlicher Dienst',
  teamSize: '12 / 80',
  stack: [
    'Scrum', 'Agile', 'Spring Boot', 'Java', 'Maven', 'Micro Services', 'Kafka',
    'Oracle SQL', 'Docker', 'OpenAPI', 'Swagger', 'Angular 20', 'NgRx',
    'TypeScript', 'HTML', 'SCSS', 'GitLab CI/CD', 'Git', 'REST', 'JWT',
    'Jasmine/Karma', 'Selenium', 'Silk Central', 'Code Analyse', 'CleanCode',
    'Jira', 'Confluence',
  ],
  description:
    'STEP ist das zentrale Stammdatensystem der Bundesagentur für Arbeit (BA) — Erfassung und Pflege von Betriebs- und Personendaten. Es fungiert als zentrales System für nahezu alle BA-IT-Verfahren, die Stammdaten benötigen, und stellt diese über REST-Endpunkte, Kafka-Events, Datei-Schnittstellen und Aufrufschnittstellen bereit.\n\nSTEP verantwortet zudem die Verwaltung von Betriebsdaten für das Meldewesen in der Sozialversicherung sowie die MAZ-Komponente (Nachweis und Meldung beitragsfreier Zeiten für die Rentenversicherung). Im Rahmen der Realisierung werden BA-IT-Standards mit Datenschutz-, Datensicherheits- und Barrierefreiheits-Auflagen kombiniert.',
  tasks: [
    'Lokalisieren, Analysieren und Beseitigen von SW-Fehlern',
    'Unterstützung bei der Erstellung von (Fach-) Konzepten und Lösungsentwürfen',
    'Sicherstellen von Continuous Integration / Continuous Delivery',
    'Anwenden der DevSecOps-Vorgehensweise',
    'Anwenden agiler Praktiken',
    'Übernahme des 3rd Level-Supports',
    'Durchführung von Testanalysen sowie Erstellung und Wartung von manuellen Komponententests, System- und End-to-End-Tests',
    'Implementierung neuer REST-Endpoints sowie Anpassung und Weiterentwicklung bestehender Schnittstellen und Kafka-basierter Event-Prozesse',
    'Weiterentwicklung von GUI-Komponenten',
    'Durchführung von Code-Reviews und Refactoring zur Verbesserung der Codequalität',
    'Sicherstellen der Barrierefreiheit',
  ],
};

const SVLFG: ExperienceProject = {
  id: 'svlfg',
  role: 'Frontend Berater',
  name: 'Modernisierung des B2B-Versicherungskundenportals',
  dateLabel: '03/2024 – 06/2025',
  customer: 'Sozialversicherung für Landwirtschaft, Forsten und Gartenbau, Kassel',
  industry: 'Versicherung',
  teamSize: '8 / 14',
  stack: [
    'Scrum', 'Agile', 'Docker', 'Migration', 'OpenAPI', 'E-Commerce', 'Spring Boot',
    'Java', 'SAP Hybris', 'SAP Commerce', 'SAP Composable Storefront', 'Angular 19',
    'NgRx', 'TypeScript', 'Nx', 'HTML', 'SCSS', 'GitLab CI/CD', 'Git', 'REST',
    'JWT', 'OAuth 2', 'Jasmine/Karma', 'Cypress', 'Software-Architektur',
    'Refactoring', 'Code Analyse', 'CleanCode', 'Jira', 'Confluence',
  ],
  description:
    'Modernisierung und Neustrukturierung eines bestehenden B2B-Versicherungskundenportals, das ursprünglich auf SAP Commerce (Hybris) basierte. Die monolithische Architektur wurde durch einen entkoppelten Headless-Ansatz ersetzt, das Frontend in Angular neu implementiert. Backend zunächst in der SAP-Hybris-/Spring-Boot-Umgebung, mit angepassten Controllern für RESTful API-Endpunkte gemäß OpenAPI-Standard. Gearbeitet wurde nach Scrum in einmonatigen Sprints.\n\nLangfristiges Ziel: schrittweise Migration von SAP Commerce auf eine moderne JHipster-basierte Lösung, da SAP Commerce hier primär als technische Basis ohne E-Commerce-Funktionalitäten diente. Damit verbunden eine signifikante Reduzierung der Lizenzkosten sowie verbesserte Wartbarkeit, Frontend/Backend-Unabhängigkeit und Zukunftssicherheit der Plattform.',
  tasks: [
    'Migration der Angular-Anwendung zu einem Monorepo mit Nx zur Strukturierung und Nutzung gemeinsamer Bibliotheken über mehrere Applikationen',
    'Etablierung und Durchsetzung von Best Practices in der Frontend-Architektur und im Code-Stil',
    'Unterstützung und fachliche Betreuung des internen Frontend-Teams',
    'Durchführung von Code-Reviews und technischem Feedback zu Merge Requests im Entwicklungsteam',
    'Enge Zusammenarbeit mit dem Backend-Team zur Integration und Nutzung von OpenAPI-basierten REST-Schnittstellen',
    'Implementierung von Oberflächenkomponenten basierend auf dem neuen Styleguide und in enger Zusammenarbeit mit dem Design-Team',
    'Gewährleistung von Barrierefreiheit, Responsive Design und Einhaltung von UX-/UI-Richtlinien',
    'Durchführung von manuellen Komponententests und Oberflächentests',
    'Entwicklung von GUI-Komponenten unter besonderer Berücksichtigung von Usability und Performance',
    'Dokumentation des Quellcodes und der Oberflächenkomponenten',
    'Aufbau und Konfiguration der Angular-Pipeline zur Unterstützung von Continuous Integration',
  ],
};

const MOBILCOM: ExperienceProject = {
  id: 'mobilcom-ecare',
  role: 'Senior Frontend-Entwickler',
  name: 'mobilcom-debitel eCare-Benutzer-Dashboard Relaunch',
  dateLabel: '10/2023 – 02/2024',
  customer: 'Freenet AG, Büdelsdorf',
  industry: 'Telekommunikationsvertrieb',
  teamSize: '8 / 15',
  stack: [
    'Scrum', 'Agile', 'GraphQL', 'Angular 18', 'TypeScript', 'Nx', 'HTML', 'SCSS',
    'GitHub CI/CD', 'Git', 'Jasmine/Karma', 'Cypress', 'Software-Architektur',
    'CleanCode', 'Jira', 'Confluence',
  ],
  description:
    'Umfassender Relaunch der bestehenden eCare Self-Service-Plattform mit dem Ziel einer schnelleren, benutzerfreundlicheren und visuell ansprechenderen Lösung. Im Mittelpunkt: Performance-Optimierung, neues responsives Design und Erweiterung um Funktionen, die Nutzer:innen einen klareren Überblick über Vertragsinformationen, Nutzungsverhalten und Kontodetails geben.\n\nDas Dashboard wurde auf Basis der bestehenden Angular-Architektur vollständig neu entwickelt — als Nx Monorepo mit durchgängiger GraphQL-Backend-Kommunikation. Funktional erweitert um personalisierte Inhalte (Marketingkampagnen, Produktempfehlungen, Sonderaktionen), die dynamisch und nutzerorientiert dargestellt werden. Entwicklung im agilen Scrum-Setup in enger Zusammenarbeit mit UX-Designern und Marketing-Stakeholdern.',
  tasks: [
    'Implementierung der neuen eCare-Dashboard-Seite zur Anzeige von Verträgen, Datenverbrauch, Rechnungen, Marketinginhalten und weiteren Informationen',
    'Zusammenarbeit mit Designer und Projektmanager zur Umsetzung der gewünschten Benutzeroberfläche',
    'Erstellung und Pflege von Jira-Tickets zur Planung und Strukturierung der Aufgaben',
    'Einbindung des neuen Dashboards in die bestehende Angular-Anwendung in Abstimmung mit dem Entwicklungsteam',
    'Entwicklung mit Angular, TypeScript, HTML und SCSS in einer Nx-Monorepo-Architektur',
    'Abruf von Backend-Daten über GraphQL mit Fokus auf gute Performance und Wartbarkeit',
    'Implementierung der neuen Oberflächen gemäß des Styleguides',
    'Gewährleistung der Prinzipien von Barrierefreiheit, Responsive Design und UX/UI-Richtlinien',
    'Durchführung von E2E-Tests',
    'Entwicklung der GUI-Komponenten unter Berücksichtigung der Usability',
  ],
};

const EMPORIX: ExperienceProject = {
  id: 'emporix',
  role: 'Senior Frontend-Entwickler',
  name: 'Agnostische Integration für Emporix',
  dateLabel: '09/2023 – 10/2023',
  customer: 'Medienwerft GmbH, Hamburg',
  industry: 'IT-Dienstleistungen',
  teamSize: '4 / 7',
  stack: [
    'Kanban', 'E-Commerce', 'OpenAPI', 'Spring Boot', 'Java', 'Emporix', 'Alokai',
    'Nuxt', 'TypeScript', 'GitLab CI/CD', 'Git', 'REST', 'JWT', 'CleanCode',
    'Jira', 'Confluence',
  ],
  description:
    'Entwicklung eines agnostischen Integrations-SDKs, das sich nahtlos in beliebige Frontend-Anwendungen einbinden lässt und eine sofort nutzbare Anbindung an die E-Commerce-Plattform Emporix bietet. Technologieunabhängig konzipiert für maximale Flexibilität und Wiederverwendbarkeit. Als Grundlage diente das offizielle Integrations-Boilerplate von Alokai zur Sicherstellung von Standardisierung und Wartbarkeit.',
  tasks: [
    'Entwicklung von TypeScript-Modulen im Integrations-SDK zur Abwicklung von Login-Prozessen sowie Produkt- und Produktlistenabfragen',
    'Implementierung und Pflege des SDKs als wiederverwendbare npm-Pakete',
    'Veröffentlichung und Versionierung der Pakete in der internen GitLab-Registry',
    'Sicherstellung der Framework-Agnostik und der einfachen Integration in verschiedene Frontend-Anwendungen',
  ],
};

const HABA: ExperienceProject = {
  id: 'haba',
  role: 'Senior Frontend-Entwickler',
  name: 'Performance-Optimierung des Onlineshops (HABA Play & HABA Pro)',
  dateLabel: '07/2023 – 09/2023',
  customer: 'HABA FAMILYGROUP, Bad Rodach',
  industry: 'Spielwarenhersteller',
  teamSize: '2 / 8',
  stack: [
    'Spring Boot', 'Java', 'E-Commerce', 'CMS', 'SAP Hybris', 'SAP Commerce',
    'SAP Composable Storefront', 'Angular 16', 'NgRx', 'TypeScript', 'HTML',
    'SCSS', 'GitLab', 'Git', 'OpenAPI', 'REST', 'JWT', 'OAuth 2', 'Jasmine/Karma',
    'Software-Architektur', 'Refactoring', 'Code Analyse', 'CleanCode',
  ],
  description:
    'Verbesserung der Performance der Onlineshops HABA Play und HABA Pro bei gleichzeitiger Senkung der Wartungs- und Betriebskosten. Die Seiten litten unter langen Ladezeiten und einer komplexen Abhängigkeit vom SAP Composable Storefront. Auf Wunsch des Kunden sollte SAP Composable Storefront entfernt werden, ohne zentrale Funktionalitäten zu verlieren.',
  tasks: [
    'Analyse der bestehenden Shops zur Erkennung von Ladezeit-Problemen und unnötigem JavaScript',
    'Umsetzung von Optimierungen zur Reduzierung der Ladezeiten, z. B. durch Lazy Loading',
    'Unterstützung beim Entfernen des SAP Composable Storefronts auf Kundenwunsch',
    'Übernahme wichtiger Funktionen in eine eigene, wiederverwendbare Bibliothek',
    'Vereinfachung und Reduzierung der Codebasis zur Senkung von Wartungsaufwand und Dateigröße',
    'Zusammenarbeit mit dem Entwicklungsteam und Stakeholdern zur Sicherstellung einer reibungslosen Umstellung ohne Funktionsverlust',
  ],
};

const OTTOS: ExperienceProject = {
  id: 'ottos-sherpa',
  role: 'Frontend-Projektlead',
  name: 'Entwicklung und Migration moderner Onlineshops mit SAP Commerce Cloud und Composable Storefront',
  dateLabel: '10/2022 – 07/2023',
  customer: 'Otto’s AG und Sherpa Outdoor, Zürich',
  industry: 'Einzelhandel',
  teamSize: '12 / 20',
  stack: [
    'Scrum', 'Agile', 'Migration', 'OpenAPI', 'E-Commerce', 'CMS', 'Spring Boot',
    'Java', 'SAP Hybris', 'SAP Commerce', 'SAP Composable Storefront',
    'Angular 16', 'NgRx', 'TypeScript', 'HTML', 'SCSS', 'GitLab CI/CD', 'Git',
    'REST', 'JWT', 'OAuth 2', 'Jasmine/Karma', 'Cypress',
    'Code Review Techniken', 'CleanCode', 'Jira', 'Confluence',
  ],
  description:
    'Entwicklung moderner Onlineshops für ottos.ch und Sherpa Outdoors auf Basis von SAP Commerce Cloud und SAP Composable Storefront. Migration vom alten SAP-Hybris-System auf eine Headless-Storefront-Architektur. Eine einheitliche Angular-Frontend-Codebasis wurde durch unterschiedliche Themes und Konfigurationen an die jeweiligen Marken angepasst. Gesteuert nach Scrum, in enger Zusammenarbeit mit Valantic (Zürich), Medienwerft (Hamburg), Team Neusta (Bremen) und Maify GmbH (Mühlingen).',
  tasks: [
    'Frontend-Projektleitung und fachliche Unterstützung der Teams von Team Neusta und Medienwerft bei der Nutzung von SAP Composable Storefront',
    'Erstellung technischer Unteraufgaben und Zuweisung von Jira-Tickets zur Strukturierung und Vereinfachung des Onboardings',
    'Überprüfung von Code und Merge Requests der Teammitglieder sowie aktive Mitarbeit am Code',
    'Enge Zusammenarbeit und Koordination mit dem Backend-Team, Product Manager und Product Owner',
    'Sicherstellung der Einhaltung von Best Practices, Code-Standards und Qualität im Frontend',
    'Unterstützung bei technischen Entscheidungen und Lösungsfindungen während des Projekts',
    'Implementierung von Oberflächenkomponenten basierend auf dem neuen Styleguide und in enger Zusammenarbeit mit dem Design-Team',
    'Gewährleistung von Barrierefreiheit, Responsive Design und Einhaltung von UX-/UI-Richtlinien',
    'Durchführung von manuellen Komponententests und E2E-Tests',
    'Entwicklung von GUI-Komponenten unter besonderer Berücksichtigung von Usability und Performance',
    'Aufbau und Konfiguration der Angular-Pipeline zur Unterstützung von Continuous Integration',
  ],
};

const LANDGARD: ExperienceProject = {
  id: 'landgard',
  role: 'Senior Frontend-Entwickler',
  name: 'B2B Onlineshops für Landgard und Ordertage',
  dateLabel: '05/2021 – 09/2022',
  customer: 'Landgard eG, Staelen-Herongen',
  industry: 'Gartenbau & Großhandel',
  teamSize: '6 / 10',
  stack: [
    'Scrum', 'Agile', 'OpenAPI', 'E-Commerce', 'CMS', 'Spring Boot', 'Java',
    'SAP Hybris', 'SAP Commerce', 'SAP Composable Storefront', 'Angular 15',
    'NgRx', 'TypeScript', 'HTML', 'SCSS', 'GitLab', 'Git', 'REST', 'JWT',
    'OAuth 2', 'CleanCode', 'Jira', 'Confluence',
  ],
  description:
    'Entwicklung moderner Onlineshops für Landgard und Ordertage auf Basis von SAP Commerce Cloud und SAP Composable Storefront. Eine einheitliche Angular-Frontend-Codebasis wurde durch unterschiedliche Themes und Konfigurationen an die jeweiligen Marken angepasst. Umgesetzt nach Scrum.',
  tasks: [
    'Umsetzung von Komponenten und Funktionalitäten im SAP Composable Storefront',
    'Anpassung der einheitlichen Angular-Codebasis an die jeweiligen Marken durch Konfiguration und Theming',
    'Enge Zusammenarbeit mit dem Backend-Team zur Integration von Schnittstellen und Datenflüssen',
    'Abstimmung mit dem Product Owner zur Umsetzung fachlicher Anforderungen',
    'Mitwirkung an Sprint-Planungen, Reviews und Daily-Meetings im Scrum-Team',
    'Implementierung von Oberflächenkomponenten basierend auf dem neuen Styleguide und in enger Zusammenarbeit mit dem Design-Team',
    'Gewährleistung von Barrierefreiheit, Responsive Design und Einhaltung von UX-/UI-Richtlinien',
    'Entwicklung von GUI-Komponenten unter besonderer Berücksichtigung von Usability und Performance',
  ],
};

const SPAR: ExperienceProject = {
  id: 'spar',
  role: 'Senior Frontend-Entwickler',
  name: 'Barrierefreiheitsoptimierung eines Onlineshops (SPAR Ungarn & Italien)',
  dateLabel: '11/2020 – 04/2021',
  customer: 'SPAR, Wien',
  industry: 'Einzelhandel',
  teamSize: '8 / 25',
  stack: [
    'Scrum', 'Agile', 'E-Commerce', 'CMS', 'Spring Boot', 'Java', 'SAP Hybris',
    'SAP Commerce', 'JSP', 'JavaScript', 'HTML', 'Less', 'GitLab', 'Git',
    'Barrierefreiheit', 'CleanCode', 'Jira', 'Confluence',
  ],
  description:
    'Barrierefreie Gestaltung der Onlineshops von SPAR Ungarn und SPAR Italien. Die bestehenden Shops basierten auf SAP Commerce (Hybris) mit einem JSP-Frontend, das nicht den aktuellen Anforderungen an digitale Barrierefreiheit entsprach. Ein Großteil des bestehenden Codes wurde überarbeitet und refaktoriert, um den geltenden Accessibility-Richtlinien zu entsprechen und eine bessere Nutzererfahrung sicherzustellen. Umgesetzt nach Scrum.',
  tasks: [
    'Analyse des bestehenden JSP-Frontends auf Barrierefreiheitsprobleme',
    'Refactoring und Anpassung von HTML, CSS und JavaScript zur Einhaltung von Accessibility-Richtlinien',
    'Durchführung von Accessibility-Tests und Nutzung entsprechender Tools zur Qualitätssicherung',
    'Unterstützung des Teams bei der Umsetzung barrierefreier Standards im Scrum-Prozess',
  ],
};

const DAW: ExperienceProject = {
  id: 'daw',
  role: 'Frontend-Entwickler',
  name: 'Entwicklung von 13 Onlineshops für DAW Group',
  dateLabel: '01/2020 – 12/2020',
  customer: 'DAW SE, Ober-Ramstadt',
  industry: 'Bauchemie / Farben- und Lackindustrie',
  teamSize: '8 / 16',
  stack: [
    'Scrum', 'Agile', 'E-Commerce', 'CMS', 'Spring Boot', 'Java', 'SAP Hybris',
    'SAP Commerce', 'JSP', 'JavaScript', 'HTML', 'Less', 'Bitbucket', 'Git',
    'Jira', 'Confluence',
  ],
  description:
    'Entwicklung eines neuen E-Commerce-Systems auf Basis von SAP Commerce Hybris, das Nutzer:innen die individuelle Farbkonfiguration ermöglicht. Das System wurde als zentrale Lösung für 13 verschiedene Onlineshops konzipiert, die sich durch eigene CMS-Inhalte, Produktsortimente und Themes unterscheiden. Umsetzung im Rahmen eines Scrum-Prozesses.',
  tasks: [
    'Implementierung von Frontend-Features, die in allen 13 Onlineshops einsetzbar sind',
    'Enge Zusammenarbeit mit dem Backend-Team',
    'Abstimmung mit dem Product Owner zur Klärung fachlicher Anforderungen',
    'Anpassung von Komponenten an unterschiedliche CMS-Inhalte, Produktdaten und Themes',
    'Implementierung von Oberflächenkomponenten basierend auf dem neuen Styleguide und in enger Zusammenarbeit mit dem Design-Team',
  ],
};

const DACHDECKER: ExperienceProject = {
  id: 'dachdecker',
  role: 'Frontend-Entwickler',
  name: 'Dachdecker-Onlineshop',
  dateLabel: '08/2019 – 01/2020',
  customer: 'Dachdecker-Einkauf Süd eG, Mannheim',
  industry: 'Handwerk & Baugewerbe',
  teamSize: '5 / 8',
  stack: [
    'Scrum', 'Agile', 'E-Commerce', 'CMS', 'Spring Boot', 'Java', 'SAP Hybris',
    'SAP Commerce', 'JSP', 'JavaScript', 'HTML', 'Less', 'Bitbucket', 'Git',
    'Jira', 'Confluence',
  ],
  description:
    'Entwicklung eines neuen Onlineshops auf Basis von SAP Commerce Hybris, speziell auf Dachdeckerbedarf ausgerichtet. Der Shop wurde individuell konfiguriert und thematisch angepasst — zugeschnitten auf die Anforderungen der Dachdeckerbranche. Umsetzung agil nach Scrum.',
  tasks: [
    'Weiterentwicklung und Umsetzung neuer Features für den bestehenden Onlineshop',
    'Behebung von Bugs und technischen Problemen im Frontend',
    'Zusammenarbeit mit dem Backend-Team zur Integration neuer Funktionen',
    'Abstimmung mit dem Product Owner zur Priorisierung von Anforderungen',
    'Implementierung von Oberflächenkomponenten basierend auf dem neuen Styleguide und in enger Zusammenarbeit mit dem Design-Team',
  ],
};

const FROSTA: ExperienceProject = {
  id: 'frosta',
  role: 'Junior Fullstack-Entwickler',
  name: 'FRoSTA Digitale Arbeitsanweisung',
  dateLabel: '01/2019 – 08/2019',
  customer: 'FRoSTA AG, Bremerhaven',
  industry: 'Lebensmittel & Getränke',
  teamSize: '5 / 3',
  stack: [
    'Android', 'Angular 6', 'Angular Material', 'SPA', 'Sass', 'HTML',
    'TypeScript', 'J2EE', 'JAX-RS', 'JDBC', 'Apache HTTP Server',
    'Microsoft SQL Server', 'REST', 'JWT', 'OpenAPI', 'Swagger', 'OOP',
    'Software-Architektur', 'Systemarchitektur', 'Git', 'GitLab', 'Postman',
  ],
  description:
    'Entwicklung einer mobilen Applikation zur digitalen Darstellung von Arbeits- und Maschinenanweisungen. Inhalte (Videos, Bilder, PDFs, Texte) erklären den Mitarbeitenden Arbeitsschritte visuell und verständlich. Pflege der Inhalte über eine separate Webanwendung mit Rechte-Management. Umfasste eine native Android-App, ein Angular-CMS sowie eine REST-API auf Basis von JAX-RS, angebunden an einen Microsoft SQL Server.',
  tasks: [
    'Frontend: Umsetzung der mobilen App mit Android Native zur Darstellung von Arbeitsanweisungen mit Videos, Bildern, PDFs und Texten',
    'Frontend: Entwicklung einer CMS-Webanwendung mit Angular 6 zur Verwaltung der Inhalte durch autorisierte Nutzer',
    'Frontend: Gestaltung einer benutzerfreundlichen UI für die Inhaltsanzeige und -pflege',
    'Backend: Entwicklung von RESTful Webservices mit JAX-RS zur Bereitstellung von Inhalten für App und CMS',
    'Backend: Anbindung und Verwaltung der Inhalte über eine Microsoft SQL Server-Datenbank',
    'Backend: Sicherstellung der Datenkonsistenz und Performance im Zusammenspiel mit Frontend und Datenbank',
    'Technische Abstimmung mit dem Product Owner zur Umsetzung der Anforderungen',
  ],
};

const LSW: ExperienceProject = {
  id: 'lsw',
  role: 'Junior Fullstack-Entwickler',
  name: 'LSW Kommissionierung',
  dateLabel: '01/2018 – 12/2018',
  customer: 'LSW Netz GmbH & Co. KG, Wolfsburg',
  industry: 'Versorgungswirtschaft',
  teamSize: '5 / 3',
  stack: [
    'Ionic', 'SPA', 'Sass', 'HTML', 'JavaScript', 'TypeScript', 'J2EE', 'JAX-RS',
    'JDBC', 'Apache HTTP Server', 'Microsoft SQL Server', 'REST', 'OOP', 'Git',
    'GitLab', 'Postman', 'SAP Java Connector',
  ],
  description:
    'Entwicklung einer mobilen Applikation für Android- und iOS-Tablets, die von Lager-Mitarbeitenden zur Kommissionierung und Qualitätssicherung eingesetzt wird. Mit der App können Barcodes gescannt, Produktinformationen angezeigt, Qualitätskontrollen durchgeführt und Arbeitsaufträge per digitaler Unterschrift bestätigt werden. Auftragsdaten werden anschließend über den SAP Java Connector (JCo) an das angebundene SAP ERP-System übertragen. Umsetzung mit Ionic im Frontend und JAX-RS Webservices sowie Microsoft SQL Server im Backend.',
  tasks: [
    'Frontend: Entwicklung einer plattformübergreifenden mobilen App mit Ionic für Android und iOS',
    'Frontend: Integration der Barcode-Scan-Funktion zur Erfassung von Produktdaten im Lager',
    'Frontend: Darstellung produktrelevanter Informationen',
    'Frontend: Implementierung der digitalen Unterschrift zur Bestätigung der Aufträge',
    'Backend: Entwicklung von RESTful Webservices mit JAX-RS zur Anbindung an das SAP ERP-System',
    'Backend: Anbindung an eine SQL-Server-Datenbank zur Verwaltung und Speicherung der Auftragsdaten',
    'Backend: Verarbeitung und Weiterleitung abgeschlossener Aufträge an das ERP-System',
    'Backend: Sicherstellung stabiler Kommunikation zwischen App und Backend-System',
  ],
};

export const EXPERIENCE: readonly ExperienceCompany[] = [
  {
    id: 'iso-gruppe',
    name: 'ISO-Gruppe',
    role: 'Senior Consultant (Software Engineer)',
    city: 'Nürnberg',
    timeline: 'Jul 2025 – present',
    projects: [STEP],
  },
  {
    id: 'medienwerft',
    name: 'Medienwerft GmbH',
    role: 'Senior Frontend Engineer',
    city: 'Hamburg',
    timeline: 'Aug 2019 – Jun 2025',
    projects: [SVLFG, MOBILCOM, EMPORIX, HABA, OTTOS, LANDGARD, SPAR, DAW, DACHDECKER],
  },
  {
    id: 'merentis',
    name: 'MERENTIS GmbH',
    role: 'Full Stack Developer',
    city: 'Bremen',
    timeline: 'Jul 2017 – Jul 2019',
    projects: [FROSTA, LSW],
  },
];
