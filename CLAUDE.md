# Mohanad Zahed — Portfolio

A scroll-driven 3D portfolio site. The visitor sees a 3D avatar at the center of the screen with tech-stack logos circling around. As they scroll, the ring choreographs through eight sections: **Hero → About → Manifesto → Skills → Knowledge → Certificates → Experience → Contact**. One persistent `<Canvas>` lives behind the page; HTML sections scroll on top.

Inspiration: activetheory.net — calm, hypnotic, cinematic motion.

## Current state

Fresh Vite + React 19 + TypeScript template. The R3F / animation stack is **not yet installed**. Source still contains the default Vite landing page in [src/App.tsx](src/App.tsx). Treat any scaffolding work as a fresh start.

## Target stack

| Tool | Purpose |
|---|---|
| Vite + React 19 + TypeScript | App shell |
| `@react-three/fiber` | Three.js as React components |
| `@react-three/drei` | R3F helpers (`useGLTF`, `Instances`, `Float`) |
| `@react-three/postprocessing` | Bloom, vignette, DoF |
| `gsap` + ScrollTrigger | Scroll choreography |
| `lenis` | Smooth scroll |
| `zustand` | Global scroll-progress store (read inside `useFrame`) |
| `leva` | Dev-only tuning panel |
| `tailwindcss` | UI / layout styling |

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build`
- `npm run lint` — ESLint
- `npm run preview` — preview production build

## Top-level conventions

- TypeScript strict; no `any` without a one-line comment explaining why.
- Components: PascalCase `.tsx`. Hooks: `useFoo.ts`. Data: `src/data/foo.ts`.
- Tailwind for UI/layout. **Never use Tailwind classes inside `<Canvas>`** — pass styling via Three.js material/light props.
- DOM and 3D worlds are separate: one fixed `<Canvas>` behind the page; HTML sections scroll over it.
- Read scroll progress through the Zustand store, not via React props/state, to avoid re-renders inside the animation loop.

## Fonts

The site font is a Zustand-backed token system with a **feature-flagged** switcher.

| File | Purpose |
|---|---|
| `src/config/featureFlags.ts` | `FONT_SWITCHER_ENABLED` (default `false`). The single switch for the font switcher — gates both the UI and the font-resolution logic. |
| `src/store/useFontStore.ts` | Roster of selectable fonts + `{ font, setFont }`. `DEFAULT_FONT = 'archivo'`. `setFont` writes `localStorage.font` and the `--font-mono` custom property. `getInitialFont()` returns `DEFAULT_FONT` immediately when the flag is off (ignoring any stored choice); when on, reads `localStorage.font` first. |
| `src/components/FontSwitcher.tsx` | The top-right `<select>` UI. Rendered in `App.tsx` only when `FONT_SWITCHER_ENABLED`. |
| `index.css` (`@theme`) | Base `--font-mono` (default **Archivo** site font) + fixed `--font-terminal` (Roboto Mono). |

Rules:

- **Two tokens, two jobs.** `--font-mono` is the **general site font** (misnomer — not necessarily monospace); the switcher mutates it. `--font-terminal` is a **fixed Roboto Mono anchor** — never switch it; the manifesto finder boxes + notebook terminal must always read as code.
- **Flag off (current): the site is locked to the default font** and any stale `localStorage.font` (from when the switcher was live) is ignored — so the font is deterministic for every visitor/device. Flip `FONT_SWITCHER_ENABLED` to `true` to restore the switcher.
- **Changing the default font** = edit `DEFAULT_FONT` in `useFontStore.ts` **and** the base `--font-mono` value in `index.css` (so the pre-JS first paint matches — no flash of the old font). Add the new family's `<link>` in `index.html`.
- Both Archivo + Roboto Mono are loaded via one shared Google Fonts `<link>` in `index.html`; other roster families are commented out there, re-enable as needed.

## i18n (bilingual EN / DE)

The site supports English and German via a custom Zustand + hook system — no third-party i18n library.

### Architecture

| File | Purpose |
|---|---|
| `src/store/useLocaleStore.ts` | Zustand store: `{ locale: 'en' \| 'de', setLocale }`. Reads `localStorage.locale` on init, else detects from `navigator.language`, else defaults to `'en'`. `setLocale` writes localStorage + sets `document.documentElement.lang`. |
| `src/i18n/dictionaries.ts` | Imports `en.json` and `de.json` and exports `DICTIONARIES: Record<Locale, unknown>`. |
| `src/i18n/useT.ts` | `useT()` hook — returns `{ t, tArray, locale }`. `t(key, vars?)` resolves dotted keys and substitutes `{var}` tokens. `tArray(key)` returns `readonly string[]` for array-valued keys. Missing keys log `console.warn` in DEV and return the key itself. |
| `src/locales/en.json` | English source strings — nested under `meta`, `hero`, `about`, `manifesto`, `skills`, `knowledge`, `certificates`, `experience`, `contact`. |
| `src/locales/de.json` | German source strings — same structure as `en.json`. |
| `src/components/LanguageSwitcher.tsx` | Fixed `top-4 right-4 z-50` toggle (`EN \| DE`). Active locale highlighted with `--color-secondary`. `aria-pressed` on each button. |

### Rules

- **Never hardcode UI copy in JSX.** All strings go through `t()` or `tArray()`.
- **Keep verbatim across both locales**: company names, customer names, tech stack tokens, URLs, dates, team-size strings, city names, file-name window titles (`context.md`, `notes.md`).
- **Translate**: role labels, project names, industry labels, descriptions, task lists, section headings, eyebrows, sub-copy, CTA labels, footer text, meta title + description.
- `src/data/experience.ts` is language-neutral: only `id`, `dateLabel`, `customer`, `teamSize`, `stack`, `link?`. All translated fields (`role`, `name`, `industry`, `description`, `tasks`) live in the JSON files under `experience.projects.<id>.*` and `experience.companies.<id>.*`.
- For a string containing HTML (e.g. `<em>` in certificates count), use `dangerouslySetInnerHTML` — content is authored, not user input.
- Auto-mode `<Typewriter>` call sites must carry `key={locale}` so a locale switch triggers remount and replays from char 0. Scroll-driven Typewriters update automatically when their `text` prop changes.
- `App.tsx` syncs `document.title` and `meta[name="description"]` via a `useEffect` keyed on `[t, locale]`.
- The section-id list now lives in `src/config/sections.ts` (`SECTION_IDS` / `NAV_SECTION_IDS`); `useSectionHash` reads `NAV_SECTION_IDS` from there. See **Analytics** below.

## Analytics

Visitor + scroll-depth analytics via **Vercel Web Analytics** (`@vercel/analytics`) — free on the Hobby plan, cookieless/no-PII (so **no GDPR consent banner needed**), enabled in the Vercel dashboard after deploy. The site is meant to be hosted on Vercel.

| File | Purpose |
|---|---|
| `src/config/sections.ts` | Canonical section ids top-to-bottom: `SECTION_IDS` (all 8 incl. `Hero`) + `NAV_SECTION_IDS` (excl. `Hero`, for hash-nav). Shared by `useScrollAnalytics` and `useSectionHash` — don't re-declare the list. |
| `src/hooks/useScrollAnalytics.ts` | Fires Vercel custom events, each **once per page load** (guarded `Set`s; ~4–8 events/visit to stay inside the free quota): `section_view { section }` the first time each section enters view (IntersectionObserver), and `scroll_depth { pct }` as global `progress` first crosses 25/50/75/100 (via `useScrollStore.subscribe`, no re-renders). |
| `App.tsx` | Calls `useScrollAnalytics()` and renders `<Analytics />` (from `@vercel/analytics/react`). |

Rules:

- **Section reach over progress bands.** "How far did they scroll" uses `section_view` (IntersectionObserver on the real `<section id>` elements), not global-progress thresholds — the progress→section mapping is intentionally fuzzy (Skills overlap + variable Experience height). `scroll_depth` is only a coarse page-level funnel.
- **Keep events coarse + guarded.** Each event fires at most once per load. Don't move tracking into `useFrame` or fire per scroll tick — it would blow the free event quota and add main-thread work.
- **Dev = no-op/debug.** Vercel events only land in production once Web Analytics is enabled in the dashboard.
- Installing `@vercel/analytics` needed `--legacy-peer-deps` once (a stray Remix peer pinned to React 18); the resulting lockfile is clean, so `npm ci` (Docker + Vercel) works without the flag.

## When asked for non-trivial work

Use plan mode and confirm before installing new dependencies, scaffolding folders, or replacing the template `App.tsx` / `main.tsx`.

## Pointers (load on demand)

- @docs/vision.md — Choreography spec: scroll timeline 0.00 → 1.00 with radius/speed/camera per band.
- @docs/content.md — CV-derived site copy: identity, experience, certifications, skills, project list.
- @docs/asset-pipeline.md — Asset formats, sources, compression commands.
- @src/scene/CLAUDE.md — R3F / Three.js rules (auto-loaded when working in `src/scene/`).
- @src/sections/CLAUDE.md — Section + scroll integration rules (auto-loaded in `src/sections/`).
