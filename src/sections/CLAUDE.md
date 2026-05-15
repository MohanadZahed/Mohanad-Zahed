# Section rules — scroll, layout, content

Sections are pure HTML/Tailwind that scrolls *over* the persistent 3D canvas. They do not contain any 3D code.

## Scroll source of truth

- One Zustand store: `useScrollStore` with a single number `progress: 0..1`.
- ScrollTrigger updates it on `onUpdate({ progress })`.
- The 3D scene reads it via `useScrollStore.getState().progress` inside `useFrame`.
- Section components may subscribe with a selector (re-render is fine here, just not in the canvas).
- **Never** read `window.scrollY` directly — Lenis virtualises it.

## Layout rules

- Each section: `min-h-screen`, `position: relative`. Pad with section-specific Tailwind, but don't fight the screen height.
- Canvas mount: `fixed inset-0 -z-10 pointer-events-none` in the root layout.
- Lenis owns smooth scroll. Do not also enable `scroll-behavior: smooth` in CSS.

## Choreography (canonical timeline)

Same numbers as `docs/vision.md`. If they ever drift, treat `docs/vision.md` as source of truth.

Section heights in viewport-units: Hero=1, About=1, **Notebook=6.25** (pinned interlude), Skills=1, **Knowledge=3** (pinned interlude), **Certificates=3** (sticky horizontal-scroll interlude), **Experience≈16** (sticky-stacking project cards), Contact=1 ≈ 32.25vh total page, scroll range ≈ 31.25vh. Treat the global-progress numbers below as nominal — Experience's height is content-driven, so for anything that needs precision use `ScrollTrigger.refresh()` measurements.

| Range | Section | What happens in 3D |
|---|---|---|
| 0.000–0.013 | Hero | Orbit r=4 with autonomous slow drift (~80s/rev), avatar centered + idle breathing, per-logo colored point lights tint the avatar as they pass |
| 0.013–0.026 | Hero → About | Avatar + orbit anchor drifts left toward x ≈ −2.6, avatar yaws 0 → ~36°, orbit shrinks 4 → 1.5, scroll layers velocity on top of the idle drift |
| 0.027 | About pin engages | Anchor's world-Y begins tracking scroll so the avatar appears glued to About in document space |
| 0.027–0.064 | About → Notebook | Avatar scrolls off-screen above with About; orbit fades / silences |
| 0.064–0.264 | Notebook | 3D canvas is silent. Section is fully HTML/CSS and uses `useScrollStore.notebookProgress` (section-local, 0..1) for its own choreography |
| 0.264–0.296 | Skills | 3D canvas idle. Section is HTML/CSS only: `CircuitBackground` PCB pattern + scattered `Microchip` cards. Avatar stays pinned off-screen. |
| 0.296–0.392 | Knowledge | 3D canvas hosts second yoga avatar; section drives its own choreography via `useScrollStore.knowledgeProgress` |
| 0.392–0.488 | **Certificates** | 3D canvas silent. Section is HTML/CSS only — `position: sticky` stage holds a horizontal strip of 5 paper-look certificate cards. Strip translateX is driven by `useScrollStore.certificatesProgress`. Phase A (sticky engaged, progress 0..⅔) translates the strip until the last card is centred; phase B (sticky released, progress ⅔..1) continues translating left while the section scrolls up out of view in the natural document flow. Cards alternate ±8° rotation. |
| 0.488–0.968 | **Experience** | 3D canvas silent. Section is HTML/CSS only — three company wrappers (ISO-Gruppe, Medienwerft, MERENTIS) each containing `position: sticky` project cards that stack on top of each other as the user scrolls. CategoryTags fan out via progressive `padding-left`. No section-local progress field — pure CSS. |
| 0.968–1.000 | **Contact** | Camera pulls back, gentle drift. Section is HTML/CSS only — fixed 750px height. Scroll-driven truck reveal: `contactProgress` (0..1) drives `clip-path` on the `<h2>` and `translateX` on `minime-truck`. Three mini-me images: coffee (`top: -192px` above section edge), truck (inline in headline row), programming (in-flow between CTAs and footer text, `-scale-x-100`). |

The pin is implicit: a single `smoothstep(0.41/31.25, 0.82/31.25, progress)` drives both the leftward translate and the yaw. Smoothstep clamps at 1.0, so anchors past About-centre stay at their settled position with no extra logic.

## Section-local progress

Sections that span more than one viewport-height (currently Notebook, Knowledge, Certificates) must NOT drive their internal phases from the global `progress` field — adding/removing such a section would drag every other section through its phases. Pattern:

- Wire a per-section ScrollTrigger (`trigger: sectionRef.current, start: 'top top', end: 'bottom bottom'`) and write `self.progress` into a dedicated store field (e.g. `notebookProgress`, `knowledgeProgress`, `certificatesProgress`).
- Components inside that section subscribe to the section-local field, not the global one. Subscribe via `useScrollStore.subscribe(...)` and write to refs/`style.transform` directly when you need 60fps motion without re-renders (see `CertificateStrip`).
- Sibling sections that need to coordinate (e.g. Skills sliding over the notebook) read a derived store field (e.g. `notebookHandoff`).
- Experience is the exception: it's a long section but its choreography is pure CSS sticky-stacking, so it doesn't need a section-local store field. Don't add one unless a future feature actually requires it.
- Certificates is the first horizontal-scroll section. It still uses CSS `position: sticky` on a 100vh inner stage (no GSAP `pin: true`) — the sticky-release moment at section.bottom = viewport.bottom is exactly the "last card centred" hand-off where the strip continues translating during the natural-flow tail.

## Content data

- Skill chip roster: `src/sections/skills/skills.data.ts` (typed array — id, label, category, level, size). Don't hard-code in JSX.
- Experience timeline: `src/data/experience.ts` — language-neutral spine only (`id`, `dateLabel`, `customer`, `teamSize`, `stack`, `link?`). Translated fields live in `src/locales/{en,de}.json`.
- Tech stack list (logo orbit): `src/data/techStack.ts`. Each entry: `{ id, label, texturePath, yearsExperience }`.
- All UI copy comes from `src/locales/en.json` and `src/locales/de.json` via `useT()` — never hardcode strings in JSX. `docs/content.md` remains the CV-derived source of truth for *what* the copy should say; the JSON files are *where* it lives at runtime.

## i18n usage in sections

- Call `const { t, tArray, locale } = useT()` at the top of any component that renders user-visible text.
- `t('dotted.key')` for single strings; `t('key', { var: value })` for `{var}` interpolation.
- `tArray('dotted.key')` for array-valued keys (finder lines, About facts, project tasks).
- Locale-aware Typewriter: scroll-driven Typewriters update automatically when `text` changes. Auto-mode Typewriters (`<Typewriter text={t('...')} start={...} />`) must receive `key={locale}` to force remount on locale switch so the animation replays from char 0.
- See `src/store/useLocaleStore.ts` and `src/i18n/useT.ts` for the full implementation.

## Typewriter modes

`src/components/Typewriter.tsx` supports two mutually-exclusive modes — pick per call site, don't mix.

- **Auto mode (default)**: `<Typewriter text="..." start={boolean} speed={45} startDelay={120} />`. Once `start` flips true, the component types itself character-by-character on its own clock. Use this for one-shot reveals where pacing should not depend on scroll velocity (e.g. the notebook section title `"elevate your system"`).
- **Scroll-driven mode**: pass `scrollProgress` (0..1) and the displayed substring becomes a pure function of that value — `text.slice(0, ⌈p · text.length⌉)`. No internal timer; characters appear and disappear with scroll. Auto-mode props (`start`, `speed`, `startDelay`) are ignored when `scrollProgress` is defined.

Use scroll-driven mode when the typing belongs to a scroll storyboard moment and the user should feel like *they* are driving the keystrokes (current users: the three notebook words `plan` / `build` / `improve`, and both finder box panels). Map a section-local progress range `[start, end]` into `clamp01((p − start) / (end − start))` and pass that. For multi-line containers (`FinderBox`), pass a single `scrollProgress` to the box and let it slice across its lines internally — line `i` of `n` types over `[i/n, (i+1)/n]` of the box's range.

The `beat-then-hide` cursor mode resets when `done` flips back to false, so scrolling backwards out of a fully-typed range correctly re-shows the cursor.

## Accessibility

- Respect `prefers-reduced-motion`: disable orbital animation, ScrollTrigger pinning, and postprocessing. The site must remain readable as a static page.
- Section landmarks: `<section aria-labelledby="...">` with a heading per section.
- Focus styles must survive Tailwind resets (don't `outline: none` without an alternative).
