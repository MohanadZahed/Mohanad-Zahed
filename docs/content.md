# Site content (CV-derived)

Source of truth for any copy that goes on the site. Distilled from the CV at [`docs/cv.md`](cv.md). When the CV updates, update this file.

## Colour palette

| Token       | Hex       | Usage                                      |
| ----------- | --------- | ------------------------------------------ |
| Primary     | `#000000` | Pure black — headings, key UI elements     |
| Secondary   | `#F3EED6` | Warm cream — accents, highlights, CTAs     |
| Tertiary    | `#38BDF8` | Sky blue — highlights, interactive accents |
| Quaternary  | `#E8C999` | Warm sand — borders, subtle surfaces       |

CSS custom properties: `--color-primary`, `--color-secondary`, `--color-tertiary`, `--color-quaternary`.
Tailwind aliases: `text-primary`, `bg-secondary`, `border-tertiary`, `bg-quaternary`, etc.

## Typography

| Role           | Family      | Token         | Tailwind    |
| -------------- | ----------- | ------------- | ----------- |
| Global / body  | Roboto Mono | `--font-mono` | `font-mono` |

Single font loaded from Google Fonts in `index.html` (`display=swap`).
Roboto Mono supports full variable weight range (`100–700`), italic included.
Set as the default `font-family` on `html` in `index.css`.

---

## Identity

- **Name**: Mohanad Zahed, B.Sc.
- **Role**: Software Architect Frontend / Senior Frontend Engineer
- **Location**: Germany
- **Email**: mzahed-p@outlook.com
- **LinkedIn**: https://www.linkedin.com/in/m-zahed/

## Headline (Hero/About)

8+ years building Angular applications for insurance, telecom, retail, and the German public sector. Focus on clean architecture, modularization, micro-frontends, and headless migrations from legacy SAP Commerce. Comfortable across the full stack — speaks the same language as backend teams and owns CI/CD from commit to release. AI-augmented development is part of how I deliver.

## Languages

- Arabic — native
- English — negotiation level
- German — negotiation level

## Education

- B.Sc. Informatics, Amman, 03/2014 (officially recognized in Germany)

## Tech stack — orbit logos (priority order)

These are the ones that get the floating-logo treatment in the orbit. Pick 10–12 for the main ring; the rest live on project cards as smaller badges.

**Primary ring**: Angular, TypeScript, React, Vue / Nuxt, RxJS, NgRx, Nx, Tailwind, SCSS, SAP Composable Storefront, Node.js, Java / Spring Boot.

**Project-card badges**: Docker, AWS (EC2), GitHub / GitLab CI/CD, Cypress, Jasmine, GraphQL, REST / OpenAPI, Kafka, Storybook, Ionic, Android Native, PWA.

**AI**: Claude Code, prompt engineering, LLM integration, token management.

## Notebook finder boxes

Three Finder-style boxes rise sequentially through the notebook interlude. Copy lives in `src/locales/{en,de}.json` under `notebook.finderBoxes[]`. File-name window titles stay verbatim across locales.

| # | Side | File name | Lines (EN) |
| --- | --- | --- | --- |
| 0 | left | `architecture.md` | `_Modular design` · `_Clean architecture` · `_Scalable solutions` |
| 1 | right | `delivery.md` | `_Rapid delivery` · `_Value-focused delivery` · `_Stakeholder alignment` |
| 2 | left | `quality.md` | `_High-quality output` · `_Best practices driven` · `_Performance optimization` |

## Skills board — microchip section

Roster lives in [`src/sections/skills/skills.data.ts`](../src/sections/skills/skills.data.ts). Categories: `frontend`, `backend`, `ai`, `devops`. General-purpose tooling (ESLint / StyleLint / Prettier / Husky / NPM / IDE / OS / collaboration apps) is intentionally excluded — the section showcases technical depth, not tool inventory.

Per-chip `level` is a self-rated 0–100 placeholder; tweak in the data file. Bar colour is derived in `Microchip.tsx` and follows:

| Level   | Colour | Token     |
| ------- | ------ | --------- |
| 0–30    | Red    | `#ef4444` |
| 31–60   | Amber  | `#fbbf24` |
| 61–100  | Green  | `#22c55e` |

Per-category accent dot: frontend `#38bdf8` · backend `#a78bfa` · ai `#34d399` · devops `#f59e0b`.

## Knowledge bubbles — pinned interlude

Roster lives in [`src/sections/knowledge/knowledge.data.ts`](../src/sections/knowledge/knowledge.data.ts). Categories: `methodology`, `architecture`, `process`, `soft`. This section captures the practice (Agile, micro-frontends, mentoring, etc.) that doesn't fit on a Skills chip — they're working concepts, not tools.

Per-category accent dot: methodology `#a78bfa` · architecture `#38bdf8` · process `#34d399` · soft `#f59e0b`.

## Certifications (timeline section)

| Date    | Certification                                                       |
| ------- | ------------------------------------------------------------------- |
| 02/2026 | iSAQB Certified Professional for Software Architecture — Foundation |
| 09/2025 | ITIL 4 Foundation                                                   |
| 08/2025 | ISTQB Certified Tester — Foundation                                 |
| 08/2025 | PRINCE2 Foundation Agile                                            |
| 02/2017 | telc Deutsch B1                                                     |

## Experience (reverse chronological — feeds Projects + Experience sections)

### ISO-Gruppe — Senior Consultant (Software Engineer)

**Nürnberg · Jul 2025 – present**

- **STEP — Bundesagentur für Arbeit** (11/2025–02/2026, public sector). Fullstack on the federal employment agency's central master-data system. Stack: Angular 20, NgRx, Spring Boot, Java, Maven, Kafka, Oracle SQL, Docker, OpenAPI, GitLab CI/CD, Jasmine/Karma, Selenium. Team 12/80. Implemented REST endpoints + Kafka event flows, evolved GUI components, code reviews, accessibility.

### Medienwerft GmbH — Senior Frontend Engineer

**Hamburg · Aug 2019 – Jun 2025**

- **SVLFG B2B Insurance Portal Modernization** (03/2024–06/2025, insurance, team 8/14). Headless rebuild of a SAP Hybris portal in Angular 19 + Nx, OpenAPI-driven REST, GitLab CI/CD. Established frontend best practices, mentored team, drove migration toward JHipster.
- **mobilcom-debitel eCare Dashboard Relaunch — Freenet AG** (10/2023–02/2024, telecom, team 8/15). Full Angular 18 rebuild on Nx monorepo, GraphQL backend, personalized marketing surfaces. Cypress E2E, design system implementation.
- **Emporix Integration SDK** (09–10/2023, IT services, team 4/7). Framework-agnostic TypeScript SDK boilerplate (based on Alokai), published as versioned npm packages to internal GitLab registry.
- **HABA FAMILYGROUP — Onlineshop Performance Optimization** (07–09/2023, toys, team 2/8). Removed SAP Composable Storefront from HABA Play and HABA Pro on customer request, extracted reusable lib, lazy-loading, dropped maintenance/runtime cost.
- **Otto's AG & Sherpa Outdoor — Frontend Project Lead** (10/2022–07/2023, retail, team 12/20). Multi-brand storefronts on Angular 16 + SAP Composable Storefront, single codebase + per-brand themes. Led FE across teams from Valantic, Medienwerft, Team Neusta, Maify.
- **Landgard / Ordertage B2B Shops** (05/2021–09/2022, horticulture wholesale, team 6/10). Angular 15 + Spartacus, multi-tenant theming.
- **SPAR Hungary & Italy — Accessibility Refactor** (11/2020–04/2021, retail, team 8/25). WCAG-driven refactor of legacy JSP frontend on SAP Hybris.
- **DAW Group — 13-Brand Storefront Platform** (01–12/2020, paint/coatings, team 8/16). Shared SAP Hybris + JSP frontend across 13 storefronts with per-brand CMS and themes.
- **Dachdecker-Einkauf Süd — B2B Shop** (08/2019–01/2020, trade & construction, team 5/8). SAP Hybris / JSP frontend features for the roofing trade.

### MERENTIS GmbH — Full Stack Engineer

**Bremen · Jul 2017 – Jul 2019**

- **FRoSTA — Digital Work Instructions** (01–08/2019, food). Native Android app + Angular 6 CMS + JAX-RS REST + MS SQL Server. Videos, images, PDFs, text — work-instruction content for shop-floor staff.
- **LSW Netz — Warehouse Picking** (01–12/2018, utilities). Ionic cross-platform tablet app (Android/iOS) for barcode scanning, QC, and signature capture; JAX-RS backend bridged to SAP ERP via SAP Java Connector.

## About-section keywords

clean architecture · modularization · micro-frontends · technical leadership · mentoring · code reviews · AI-augmented development · accessibility (WCAG) · shift-left testing · CI/CD ownership · headless / composable commerce · Nx monorepos.

## Soft skills

Adaptability · continuous learning · organisation · decision-making · technical leadership · flexibility · receptiveness to feedback · customer focus · solution-orientation · strategic thinking · team spirit · know-how transfer · ownership · time management · coaching.
