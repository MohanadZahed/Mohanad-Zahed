# Scene rules — R3F / Three.js

These rules are non-negotiable when touching anything inside `src/scene/`. Violating them produces jank that is hard to debug later.

## React + animation loop

- **Never trigger React re-renders inside `useFrame`.** Don't call `setState`, don't subscribe to a Zustand store via a selector. Read scroll progress via `useScrollStore.getState().progress` or a stable `useRef`. Mutate `mesh.position`, `mesh.rotation`, `material.opacity` on refs directly.
- **Lerp, don't snap.** Default tween factor `0.1` for position, `0.05` for rotation. This is what gives motion the buttery, slightly-delayed Active Theory feel. Use `vec.lerp(target, 0.1)` or `THREE.MathUtils.damp` for frame-rate independence.
- **`frameloop="demand"`** for static moments, `"always"` while scrolling. Toggle off when `document.visibilityState === 'hidden'`. **Note:** the hero intro (avatar fade + logo-ring expand) reads `useScrollStore.heroStartedAt` via `getState()` inside `useFrame` — a store write that does **not** invalidate a `demand` loop. The Canvas currently runs the default `"always"`; if you switch the hero to `demand`, also `invalidate()` when `heroStartedAt` is set or the avatar/ring will never fade in.

## Knowledge warm-up (keep heavy off-screen assets out of `useProgress`)

Anything drei loads through `DefaultLoadingManager` lands in `useProgress().total`, which `HeroIntroGate` ([../App.tsx](../App.tsx)) waits on before stamping `heroStartedAt` — so **a module-level `useGLTF.preload` / `useTexture.preload` for an asset that isn't on screen in the hero makes the visitor stare at the dark veil for it.** That regression happened twice (the yoga GLB, then MathBackdrop's 594 KB of math SVGs) — both are now explicitly commented as "no module-level preload".

The Knowledge subtree (`YogaAvatar` + `MathBackdrop`) is instead mounted by [Scene.tsx](Scene.tsx) at whichever comes first:

1. `useScrollStore.assetsReady` **and** `KNOWLEDGE_WARMUP_DELAY_S` past `heroStartedAt` (= `LOGO_FADE_END + 0.3`, i.e. just after the last intro beat), or
2. `knowledgeApproach > 0` — the fallback for a visitor who flings straight down, for `saveData`, and for the case where loading never completes.

Rules when touching this:

- **Mounting is the fetch.** drei's Suspense cache means a separate `preload()` call adds nothing; don't reintroduce one.
- **Gate on `assetsReady`, not on `heroStartedAt` alone.** `heroStartedAt` is also stamped by `HeroIntroGate`'s 4 s safety timeout, which can fire while the hero avatar is still downloading; starting a second GLB then just splits the pipe. Measured on Slow 4G (1.6 Mbit), warming up off `heroStartedAt` alone pushed `avatar.glb`'s completion from ~56 s to ~65 s. `assetsReady` is set only from the real `useProgress` loaded condition, and is **latched** — the Knowledge subtree's own loads push `useProgress` back to active, which must not clear it.
- **Warm up after the intro, not during it.** The download is network work, but the glTF parse + meshopt decode are main-thread and would hitch the name-reveal tween.
- **The subtree carries its own `<Preload all />`.** The one in `App.tsx` runs `gl.compile` in a `useLayoutEffect([])` — once, before this subtree exists — so without a second one the program compile + texture upload hits the first rendered frame mid-scroll. drei's `Preload` temporarily un-hides `visible === false` objects, which is why it works on `YogaAvatar`'s hidden group.
- **`navigator.connection.saveData` skips the early warm-up**, falling back to fetch-on-approach.
- Keep the GLB itself small — see [../../docs/asset-pipeline.md](../../docs/asset-pipeline.md) → "Yoga avatar". No amount of preload scheduling saves an 18 MB uncompressed export.

## Hero intro readiness

- The hero's first-load reveal is gated on WebGL readiness: `<Preload all />` inside the `<Canvas>` ([App.tsx](../App.tsx)) forces shader/texture compilation during load, and `HeroIntroGate` stamps `useScrollStore.heroStartedAt` once drei `useProgress` reports loaded + compiled. The avatar ([Avatar.tsx](Avatar.tsx)) and logo planes ([LogoPlane.tsx](LogoPlane.tsx)) compute their fade from `(performance.now() − heroStartedAt) / 1000`; they stay at opacity 0 while it's `null`. Keep `<Preload all />` — it's what moves the init hitch into the pre-intro dark hold instead of mid-animation; the `HeroLogo` DOM intro (the typographic MOZ build) is held behind a dark veil until the same `heroStartedAt` stamp. Full rationale: [../sections/CLAUDE.md](../sections/CLAUDE.md) → "Hero logo intro + corner mark".

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
