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

Section heights in viewport-units: Hero=1, About=1, **Notebook=6**, Skills=1, Experience=1, Contact=1 → 11vh total page, scroll range = 10vh.

| Range | Section | What happens in 3D |
|---|---|---|
| 0.00–0.04 | Hero | Orbit r=4 with autonomous slow drift (~80s/rev), avatar centered + idle breathing, per-logo colored point lights tint the avatar as they pass |
| 0.04–0.08 | Hero → About | Avatar + orbit anchor drifts left toward x ≈ −2.6, avatar yaws 0 → ~36°, orbit shrinks 4 → 1.5, scroll layers velocity on top of the idle drift |
| 0.07 | About pin engages | Anchor's world-Y begins tracking scroll so the avatar appears glued to About in document space |
| 0.07–0.20 | About → Notebook | Avatar scrolls off-screen above with About; orbit fades / silences |
| 0.20–0.80 | Notebook | 3D canvas is silent. The Notebook section is fully HTML/CSS and uses `useScrollStore.notebookProgress` (section-local, 0..1) for its own choreography — see `docs/vision.md` |
| 0.80–0.90 | Skills | 3D canvas idle. Section is HTML/CSS only: `CircuitBackground` PCB pattern + scattered `Microchip` cards (per-skill glowing progress bar). Avatar stays pinned off-screen above. |
| 0.90–0.95 | Experience | Logos return to slow ambient orbit r=6 around the pinned avatar (off-screen) |
| 0.95–1.00 | Contact | Camera pulls back, gentle drift, footer fades in |

The pin is implicit: a single `smoothstep(0.04, 0.08, progress)` drives both the leftward translate and the yaw. Smoothstep clamps at 1.0, so progress ≥ 0.08 leaves the anchor at its settled position with no extra logic.

## Section-local progress

Sections that span more than one viewport-height (currently just Notebook) must NOT drive their internal phases from the global `progress` field — adding/removing such a section would drag every other section through its phases. Pattern:

- Wire a per-section ScrollTrigger (`trigger: sectionRef.current, start: 'top top', end: 'bottom bottom'`) and write `self.progress` into a dedicated store field (e.g. `notebookProgress`).
- Components inside that section subscribe to the section-local field, not the global one.
- Sibling sections that need to coordinate (e.g. Skills sliding over the notebook) read a derived store field (e.g. `notebookHandoff`).

## Content data

- Skill chip roster: `src/sections/skills/skills.data.ts` (typed array — id, label, category, level, size). Don't hard-code in JSX.
- Experience timeline: `src/data/experience.ts`.
- Tech stack list (logo orbit): `src/data/techStack.ts`. Each entry: `{ id, label, texturePath, yearsExperience }`.
- All site copy comes from `docs/content.md` (CV-derived).

## Accessibility

- Respect `prefers-reduced-motion`: disable orbital animation, ScrollTrigger pinning, and postprocessing. The site must remain readable as a static page.
- Section landmarks: `<section aria-labelledby="...">` with a heading per section.
- Focus styles must survive Tailwind resets (don't `outline: none` without an alternative).
