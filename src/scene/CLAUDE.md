# Scene rules — R3F / Three.js

These rules are non-negotiable when touching anything inside `src/scene/`. Violating them produces jank that is hard to debug later.

## React + animation loop

- **Never trigger React re-renders inside `useFrame`.** Don't call `setState`, don't subscribe to a Zustand store via a selector. Read scroll progress via `useScrollStore.getState().progress` or a stable `useRef`. Mutate `mesh.position`, `mesh.rotation`, `material.opacity` on refs directly.
- **Lerp, don't snap.** Default tween factor `0.1` for position, `0.05` for rotation. This is what gives motion the buttery, slightly-delayed Active Theory feel. Use `vec.lerp(target, 0.1)` or `THREE.MathUtils.damp` for frame-rate independence.
- **`frameloop="demand"`** for static moments, `"always"` while scrolling. Toggle off when `document.visibilityState === 'hidden'`. **Note:** the hero intro (avatar fade + logo-ring expand) reads `useScrollStore.heroStartedAt` via `getState()` inside `useFrame` — a store write that does **not** invalidate a `demand` loop. The Canvas currently runs the default `"always"`; if you switch the hero to `demand`, also `invalidate()` when `heroStartedAt` is set or the avatar/ring will never fade in.

## Hero intro readiness

- The hero's first-load reveal is gated on WebGL readiness: `<Preload all />` inside the `<Canvas>` ([App.tsx](../App.tsx)) forces shader/texture compilation during load, and `HeroIntroGate` stamps `useScrollStore.heroStartedAt` once drei `useProgress` reports loaded + compiled. The avatar ([Avatar.tsx](Avatar.tsx)) and logo planes ([LogoPlane.tsx](LogoPlane.tsx)) compute their fade from `(performance.now() − heroStartedAt) / 1000`; they stay at opacity 0 while it's `null`. Keep `<Preload all />` — it's what moves the init hitch into the pre-intro hold instead of mid-animation. Full rationale: [../sections/CLAUDE.md](../sections/CLAUDE.md) → "Hero load intro".

## Logo ring drag

The hero logo ring is grab-and-spin draggable with the mouse ([LogoRingControls.tsx](LogoRingControls.tsx)). Because the `<Canvas>` wrapper is `pointer-events-none` (page scroll passes through it), **R3F's raycast/pointer system is unavailable** — don't reach for `onPointerDown` on the meshes. Instead the controller attaches **window-level pointer listeners** and hit-tests a screen-space annulus it recomputes each frame by projecting the ring's world centre + radius (reads `anchorRef.matrixWorld` + `VISUAL_CENTER_OFFSET_Y`). The cursor (`grab`/`grabbing`) is set on `document.body`, not the canvas, for the same reason.

The drag feeds `useScrollStore.logoSpin` — a **purely additive** angular offset consumed in [lib/logoPosition.ts](lib/logoPosition.ts) (`angle += spin`) via [LogoPlane.tsx](LogoPlane.tsx). While dragging, the angle tracks the mouse 1:1; on release the captured velocity becomes momentum that decays back to 0 (`exp(-DECAY·dt)`), returning the ring to its idle/scroll spin with no seam. Grab is gated to the hero state (`progress < HERO_GRAB_MAX`) and **disabled on coarse-pointer devices**. Tuning knobs live at the top of `LogoRingControls.tsx`. Desktop scroll is wheel-driven (Lenis), so the horizontal drag never fights scroll.

## Geometry and materials

- **Instancing**: when ≥8 logos share a geometry, use drei's `<Instances>` + `<Instance>`. Don't mount N separate meshes.
- **Logo planes**: prefer `PlaneGeometry` + transparent texture over modelled 3D logos. Billboard them (always face camera) for the floating-UI feel; let them tumble freely only if the design calls for it.
- **Avatar**: `.glb` only, draco + meshopt compressed. Load with `useGLTF` and `useGLTF.preload(url)` at module top.

## Textures and environment

- Format priority: `.ktx2` (basisu) > `.webp` > `.png`. Use `useTexture` from drei.
- Color textures must set `colorSpace = THREE.SRGBColorSpace`; data textures (normal, roughness) stay linear.
- **No HDRI / `<Environment>`**. Lighting is done with Three.js lights + CSS gradient on the canvas parent (see `docs/asset-pipeline.md` → Lighting).

## Postprocessing

- Bloom + Vignette + DoF only. Disable the entire postprocessing stack on mobile / coarse-pointer devices.
- Wrap every `useGLTF` / `useTexture` in `<Suspense>`.

## Performance budget (hard targets)

- 60fps on MacBook Air M1, 30fps on mid-range Android.
- ≤120 draw calls in the hero scene.
- ≤30 MB total transferred GPU assets.
- `<Canvas dpr={[1, 2]}>` — never uncapped.
- Use `r3f-perf` from day one in dev builds.

## Mobile fallback

- Detect via `window.matchMedia('(pointer: coarse)').matches`.
- Simplified scene: no postprocessing, fewer logos, no DoF, DPR capped at 1.5, lower-poly avatar.

## Imports

- Prefer R3F components and drei helpers. Don't `import * as THREE from 'three'` unless you need a constant or class drei doesn't expose.
