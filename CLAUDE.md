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
- `npm run build:prerender` — build, then snapshot the composed DOM into `dist/index.html` (what Vercel runs — see **Deploy & prerender**)
- `npm run prerender` — the snapshot step alone, against an existing `dist/`
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

## Favicon & app icons

The favicon is the **MOZ brand mark reduced to "MO"** — cream `M` + gold `O` + gold circuit underline on black, mirroring `HeroLogo.tsx`. Everything is generated from one script; **don't hand-edit the files in `public/`**.

| File | Purpose |
|---|---|
| `scripts/generate-favicon.mjs` | The generator. Emits every file below. Deps are deliberately **not** in `package.json` — run `npm i --no-save opentype.js sharp png-to-ico && node scripts/generate-favicon.mjs`. |
| `public/favicon.svg` | The one that actually matters — modern browsers prefer it over the `.ico` **even in a 16px tab**. |
| `public/favicon.ico` | 16/32/48 members. Legacy browsers + Google's search-result icon. |
| `public/apple-touch-icon.png` | 180×180, full-bleed (iOS masks the corners itself). |
| `public/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Android / PWA install, referenced by `site.webmanifest`. |
| `public/site.webmanifest` | Manifest; `theme_color` / `background_color` track `--color-primary` (`#000000`). |

Rules:

- **Glyphs ship as outline paths, never `<text>`.** A favicon is rasterized outside the page's font context, so a `<text>` element would fall back to whatever the OS has. The script pulls Archivo Bold from the Google Fonts CSS API (legacy UA → TTF, not woff2) and converts `M` + `O` via `opentype.js` at build time. This is why `favicon.svg` has no webfont dependency.
- **Tune for 16px, not for the 512 preview.** Padding is `PAD_FRAC = 0.08` and the circuit strokes are `STROKE_MUL = 1.3`× the hero's literal ratios. At the hero's own ratios with comfortable padding the O's counter fills in and the M turns to grey mush. Re-render at 16/32px and look before changing either constant.
- **The `.ico`'s 16px member reaches almost nobody.** Chrome/Firefox/Safari read `favicon.svg` instead, so 16px legibility has to be solved *in the SVG*. The simplified 16px `.ico` member (plain bar, no node/end circles — `simplify: true`) is only for old Edge/Safari; it is not the fix.
- **`favicon.ico` must stay at the public root.** Google's crawler probes `/favicon.ico` directly and doesn't always follow the `<link>`.
- Changing the mark = edit the geometry constants in the generator (they mirror `HeroLogo.tsx`'s `UNDERLINE_W` / `NODE_D` / `CIRC_D` at `CORNER_LOGO_H`) and re-run it. Full rationale: `docs/asset-pipeline.md` → "Favicon / app icons".

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
- `src/data/experience.ts` is language-neutral: only `id`, `dateLabel`, `ongoing?`, `customer`, `teamSize`, `stack`, `link?`. A running project sets `ongoing: true` and a bare start date (`'05/2026'`); `ProjectCard` appends the localized `experience.labels.present` ("present" / "heute") so the "– today" half stays translatable. All translated fields (`role`, `name`, `industry`, `description`, `tasks`) live in the JSON files under `experience.projects.<id>.*` and `experience.companies.<id>.*`.
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

## Deploy & prerender (SEO)

The site is a client-rendered SPA, so the shipped `index.html` is an empty `<div id="root">` — **crawlers that don't execute JS (LinkedIn, WhatsApp, Slack, X, Bing) would see nothing.** A post-build step snapshots the fully-composed DOM back into `dist/index.html`; the client still boots from the same `<script>` tag and re-renders over it.

| File | Purpose |
|---|---|
| `scripts/prerender.mjs` | Boots `vite preview`, drives a real headless Chrome (Puppeteer) over the built site, and writes `page.content()` into `dist/index.html`. A **real browser**, not jsdom/SSR: the page is WebGL + GSAP/ScrollTrigger/Lenis and touches `window`/`matchMedia`. Pins the snapshot to English (`navigator.language` override + `Accept-Language`) and forces `prefers-reduced-motion: reduce` so the hero is captured composed, not mid-tween. |
| `scripts/vercel-build.sh` | The Vercel build entrypoint. Installs Chrome's runtime shared libraries, then runs `npm run build:prerender`. |
| `vercel.json` → `buildCommand` | `bash scripts/vercel-build.sh`. **This is the switch that makes any of it run.** |

Rules:

- **`vercel.json` owns the build command, not the dashboard.** With no `buildCommand`, Vercel runs the default `npm run build` and the prerender silently never happens — that shipped an empty page to production for real. Leave the dashboard's Build Command field empty so there's one source of truth.
- **Vercel's Amazon Linux builder has none of Chrome's system libraries.** Puppeteer downloads the binary fine, then it dies with `error while loading shared libraries: libnspr4.so`. `vercel-build.sh` installs `nss nspr atk at-spi2-atk at-spi2-core cups-libs libdrm libX11 libX* libxcb libxkbcommon mesa-libgbm pango alsa-lib` (+ `liberation-fonts`, so `HeroLogo`'s glyph measurements for the circuit underline land on real metrics). The install is best-effort — `dnf` → `microdnf` → `yum`, with a per-package retry because dnf aborts a whole transaction over one unknown name — and never fails the deploy on its own.
- **`npx puppeteer browsers install chrome` is in `build:prerender` on purpose.** Puppeteer's postinstall puts Chrome in `~/.cache/puppeteer`, which Vercel does *not* carry between builds, while it *does* restore `node_modules`. Without the explicit install, the first deploy works and every cached one after it silently doesn't.
- **Failure is soft by design — so it must leave evidence.** `prerender.mjs` exits 0 on any error (a Chromium hiccup must never break a deploy), which makes a skipped prerender indistinguishable from success in a green build log. It therefore writes `dist/prerender-status.json` on **both** paths. Verify any deploy with `curl -s https://www.mohanadzahed.com/prerender-status.json`: **404** = the build command never ran the script; **`{"ok":false}`** = it ran and Chrome/the snapshot failed, with the error and (on Linux) a `missingLibs` array from `ldd` — the full list at once, since Chrome's loader only ever reports the first missing `.so`. **`{"ok":true}`** = real content is being served. `PRERENDER_STRICT=1` in the Vercel env turns the soft exit into a hard build failure.
- **Sanity check that outranks the breadcrumb:** `curl -s https://www.mohanadzahed.com/ | wc -c`. ~200 KB = prerendered; 4.8 KB = empty SPA shell.
- **Canonical host is `www`.** The apex 308-redirects to `https://www.mohanadzahed.com/`, so `canonical`, `og:url`, `og:image`, `twitter:image`, the JSON-LD `url`/`image` (all in `index.html`), `public/robots.txt`'s `Sitemap:` line and `public/sitemap.xml`'s `<loc>` all use the `www` host. Don't reintroduce apex URLs — a canonical that points at a redirecting URL is a self-conflicting signal.
- **Known gap:** `og-image.png` is referenced by four tags but **does not exist** (404), so link previews render imageless. Candidate fix: a `page.screenshot()` at 1200×630 inside `prerender.mjs`, reusing the browser that's already open on the composed page.
- **The Dockerfile stays on plain `npm run build`.** That's the self-host/nginx path on `node:22-alpine`, where Chrome would need a pile of extra packages; it ships the un-prerendered SPA deliberately.

## When asked for non-trivial work

Use plan mode and confirm before installing new dependencies, scaffolding folders, or replacing the template `App.tsx` / `main.tsx`.

## Pointers (load on demand)

- @docs/vision.md — Choreography spec: scroll timeline 0.00 → 1.00 with radius/speed/camera per band.
- @docs/content.md — CV-derived site copy: identity, experience, certifications, skills, project list.
- @docs/asset-pipeline.md — Asset formats, sources, compression commands.
- @src/scene/CLAUDE.md — R3F / Three.js rules (auto-loaded when working in `src/scene/`).
- @src/sections/CLAUDE.md — Section + scroll integration rules (auto-loaded in `src/sections/`).
