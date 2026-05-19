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
- **Viewport-height unit: always `svh`, never `dvh` or plain `vh`.** Mobile browsers (iOS Safari, Chrome Android) show/hide the URL bar on scroll-direction reversal. `dvh` tracks that live and causes vertical jiggle as the page reflows; `vh` resolves to the *large* viewport so it disagrees with `dvh` neighbours. `svh` (small viewport — URL-bar-visible state) is stable across URL-bar toggles in every browser that supports `dvh`, so the layout never reflows. Applies to: section heights, sticky-stage heights, paddings, anchor `top`s, font-size `clamp()` fallbacks — anywhere you'd reach for a viewport-height unit. The numeric constants (`SECTION_VH`, `STAGE_SCROLL_UNIT_VH`, etc.) keep their `_VH` names; only the *unit string* appended at the call site is `svh`. For JS that needs the live viewport height, read `document.documentElement.clientHeight` (the svh-equivalent layout viewport — stable across URL-bar toggles), not `window.innerHeight` or `visualViewport.height`.

## Choreography (canonical timeline)

Same numbers as `docs/vision.md`. If they ever drift, treat `docs/vision.md` as source of truth.

Section heights in viewport-units: Hero=1, About=1, **Notebook=6.25** (pinned interlude), Skills=1, **Knowledge=3** (pinned interlude), **Certificates=3** (sticky horizontal-scroll interlude), **Experience≈16** (sticky-stacking project cards), Contact=1 ≈ 32.25vh total page, scroll range ≈ 31.25vh. Treat the global-progress numbers below as nominal — Experience's height is content-driven, so for anything that needs precision use `ScrollTrigger.refresh()` measurements.

| Range | Section | What happens in 3D |
|---|---|---|
| Hero state | Hero | Orbit r=4 with autonomous slow drift (~80s/rev), avatar centered on `[data-avatar-anchor="hero"]` div + idle breathing, per-logo colored point lights tint the avatar as they pass |
| Hero → About | Hero → About | Avatar + orbit anchor lerps from the hero anchor div to the about anchor div, avatar yaws 0 → ~36°, orbit shrinks 4 → 1.5. Blend `t` is driven by the about div's on-screen Y, **not** global scroll — published to `useScrollStore.avatarBlend` |
| About settled | About | Anchor follows `[data-avatar-anchor="about"]` div in document space — the avatar tracks its bounding rect so it scrolls off-screen upward with About automatically |
| 0.064–0.264 | About → Notebook (continued) | About div scrolls upward out of viewport; avatar follows it off-screen for free (no special pin math) |
| 0.064–0.264 | Notebook | 3D canvas is silent. Section is fully HTML/CSS and uses `useScrollStore.notebookProgress` (section-local, 0..1) for its own choreography. Three Finder-style boxes rise sequentially from below (left → right → left), each on its own scroll window in `FINDER_BOX_RANGES` (`[0.08,0.21] / [0.16,0.29] / [0.24,0.37]`): the next box starts rising while the previous is ~30% from the viewport top, and each box types its three lines in scroll-driven mode, finishing as it passes the vertical centre. Box 2's exit (0.37) is also `SCALE_START`, so the notebook scale-up begins exactly when the last box leaves the viewport. A looping muted `<video>` (`/videos/notebook-video.{webm,mp4}`) plays behind the laptop image inside `SCREEN_RECT`; over `[TERMINAL_OPEN_START=0.33, TERMINAL_OPEN_END=0.37]` a black "terminal" rectangle scales out of the screen's bottom-right corner (`transformOrigin: bottom right`, `scale(0 → 1)`) to cover it. Once covered, the video is paused; the rectangle is sized in `%` of `SCREEN_RECT` so it scales with the notebook during `SCALE_START → SCALE_END` for free. On mobile (`< 768px`), finder boxes shrink to `width = min(268, viewport.w − 32)` (`height = width × 0.55`) and hard-anchor to the viewport edge (left/right/left), overlapping the small notebook image on purpose. |
| 0.264–0.296 | Skills | 3D canvas idle. Section is HTML/CSS only: `CircuitBackground` PCB pattern + scattered `Microchip` cards. Avatar stays pinned off-screen. |
| 0.296–0.392 | Knowledge | Backdrop swaps to `--color-quaternary` beige (faded in across late Skills via global progress) with a black disc that falls from above and expands to a corner-filling rectangle covering the whole viewport. The disc stays opaque past Knowledge so the black persists into Certificates. 3D canvas hosts the yoga avatar + 7 sky-blue math-pattern SVGs (`MathBackdrop`) that start clustered at the arc centre and burst outward to their upper-ellipse anchors in lockstep with the disc expansion; rest opacity 0.15, cursor proximity lifts to 1. Section choreography via `useScrollStore.knowledgeProgress`; beige fade-in is driven by `useScrollStore.progress`. |
| 0.392–0.488 | **Certificates** | 3D canvas silent. Section is HTML/CSS only — `position: sticky` stage holds a horizontal strip of 5 paper-look certificate cards. Strip translateX is driven by `useScrollStore.certificatesProgress`. The strip ramps `0 → −X_visible` across the full sticky-engaged window (progress 0..1, `X_visible = max(0, lastCardRight + sidePad − viewportW)`); at progress 1 the last card is fully visible and sticky releases simultaneously, so the section then scrolls up naturally with no further horizontal motion. Cards alternate ±8° rotation. |
| 0.488–0.968 | **Experience** | 3D canvas silent. Section is HTML/CSS only — three company wrappers (ISO-Gruppe, Medienwerft, MERENTIS) each containing `position: sticky` project cards that stack on top of each other as the user scrolls. CategoryTags fan out via progressive `padding-left`. No section-local progress field — pure CSS. |
| 0.968–1.000 | **Contact** | Camera pulls back, gentle drift. Section is HTML/CSS only — fixed 750px height. Scroll-driven truck reveal: `contactProgress` (0..1) drives `clip-path` on the `<h2>` and `translateX` on `minime-truck`. Three mini-me images: coffee (`top: -192px` above section edge), truck (inline in headline row), programming (in-flow between CTAs and footer text, `-scale-x-100`). |

Avatar position is **DOM-anchor-driven**, not global-progress-driven. Two zero-size hidden `<div data-avatar-anchor="hero"|"about">` markers are placed by CSS in [Hero.tsx](Hero.tsx) and [About.tsx](About.tsx). Each frame [Scene.tsx](../scene/Scene.tsx) measures both rects, projects them via `rectToWorld()` ([../scene/lib/projectAnchor.ts](../scene/lib/projectAnchor.ts)), and lerps the avatar's world position between them. The blend `t = smoothstep(vh, vh × 0.3, aboutCenterFromTop)` is derived from the About anchor's on-screen Y — the avatar reaches its final pose when that div has scrolled to 30% from the viewport bottom. `t` is published to `useScrollStore.avatarBlend` so [Avatar.tsx](../scene/Avatar.tsx) can drive yaw from the same signal. Past `t = 1` the avatar tracks the about div directly; because the div is in document flow, it scrolls upward with the page and the avatar leaves the viewport automatically — no `pxPastAboutCenter` pin math required. **Tuning the avatar landing spot on a new screen size = editing the about anchor div's Tailwind classes, not Scene.tsx.**

## Section-local progress

Sections that span more than one viewport-height (currently Notebook, Knowledge, Certificates) must NOT drive their internal phases from the global `progress` field — adding/removing such a section would drag every other section through its phases. Pattern:

- Wire a per-section ScrollTrigger (`trigger: sectionRef.current, start: 'top top', end: 'bottom bottom'`) and write `self.progress` into a dedicated store field (e.g. `notebookProgress`, `knowledgeProgress`, `certificatesProgress`).
- Components inside that section subscribe to the section-local field, not the global one. Subscribe via `useScrollStore.subscribe(...)` and write to refs/`style.transform` directly when you need 60fps motion without re-renders (see `CertificateStrip`).
- Sibling sections that need to coordinate (e.g. Skills sliding over the notebook) read a derived store field (e.g. `notebookHandoff`).
- Experience is the exception: it's a long section but its choreography is pure CSS sticky-stacking, so it doesn't need a section-local store field. Don't add one unless a future feature actually requires it.
- Certificates is the first horizontal-scroll section. It still uses CSS `position: sticky` on a 100svh inner stage (no GSAP `pin: true`) — the sticky-release moment at section.bottom = viewport.bottom is exactly the "last card centred" hand-off where the strip continues translating during the natural-flow tail.

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
