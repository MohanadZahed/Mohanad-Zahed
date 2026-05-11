# Mohanad Zahed — Portfolio ("The Orbit")

A scroll-driven 3D portfolio site. The visitor sees a 3D avatar at the center of the screen with tech-stack logos orbiting around. As they scroll, the orbit choreographs through eight sections: **Hero → About → Notebook → Skills → Knowledge → Certificates → Experience → Contact**. One persistent `<Canvas>` lives behind the page; HTML sections scroll on top.

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

## When asked for non-trivial work

Use plan mode and confirm before installing new dependencies, scaffolding folders, or replacing the template `App.tsx` / `main.tsx`.

## Pointers (load on demand)

- @docs/vision.md — Choreography spec: scroll timeline 0.00 → 1.00 with radius/speed/camera per band.
- @docs/content.md — CV-derived site copy: identity, experience, certifications, skills, project list.
- @docs/asset-pipeline.md — Asset formats, sources, compression commands.
- @src/scene/CLAUDE.md — R3F / Three.js rules (auto-loaded when working in `src/scene/`).
- @src/sections/CLAUDE.md — Section + scroll integration rules (auto-loaded in `src/sections/`).
