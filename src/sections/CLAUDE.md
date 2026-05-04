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

| Range | Section | What happens in 3D |
|---|---|---|
| 0.00–0.20 | Hero | Orbit r=4 with autonomous slow drift (~80s/rev), avatar centered + idle breathing, per-logo colored point lights tint the avatar as they pass |
| 0.20–0.35 | Hero → About | Avatar + orbit anchor drifts left toward x ≈ −2.6, avatar yaws 0 → ~36°, orbit shrinks 4 → 1.5, scroll layers velocity on top of the idle drift |
| 0.35–0.50 | About | Logos snap to flat grid behind avatar; avatar settled at left, yaw ~36° (3/4 view) |
| 0.50–0.70 | Projects | Avatar **pinned** at left (no longer scrolls with viewport); logos detach one-by-one into project-card corners |
| 0.70–0.85 | Experience | Avatar still pinned at left, fades to ~30% opacity; logos return to slow ambient orbit r=6 around the pinned avatar |
| 0.85–1.00 | Contact | Avatar pinned at left, full opacity; camera pulls back, gentle drift, footer fades in |

The pin is implicit: a single `smoothstep(0.20, 0.50, progress)` drives both the leftward translate and the yaw. Smoothstep clamps at 1.0, so progress ≥ 0.50 leaves the anchor at its settled position with no extra logic.

## Content data

- Project entries: `src/data/projects.ts` (typed array). Don't hard-code in JSX.
- Experience timeline: `src/data/experience.ts`.
- Tech stack list (logo orbit): `src/data/techStack.ts`. Each entry: `{ id, label, texturePath, yearsExperience }`.
- All site copy comes from `docs/content.md` (CV-derived).

## Accessibility

- Respect `prefers-reduced-motion`: disable orbital animation, ScrollTrigger pinning, and postprocessing. The site must remain readable as a static page.
- Section landmarks: `<section aria-labelledby="...">` with a heading per section.
- Focus styles must survive Tailwind resets (don't `outline: none` without an alternative).
