# Vision — "The Orbit"

## Metaphor

You are the gravitational center. The tech stack orbits you like planets. Scrolling pulls the orbit through phases — chaos to order to dispersal — telling the story "I work with this whole ecosystem; here's how each piece fits."

It must feel calm and hypnotic, never aggressive. Soft rim lighting on the avatar, slight depth-of-field blur on the furthest logos, neutral palette with a vignette and subtle grain.

## Scroll timeline (0.00 → 1.00, normalised)

Section heights in viewport-units: Hero=1, About=1, **Notebook=7** (long pinned interlude), Skills=1, Experience=1, Contact=1 → 12 viewport-heights total, scroll range = 11vh. Section TOPS in global progress: Hero=0.00, About=0.0909, Notebook=0.1818, Skills=0.8182, Experience=0.9091, Contact=1.00. About is centred in the viewport at progress ≈ 0.0909.

Because Notebook (7vh) spans more than one viewport, it drives its internal choreography from a section-local progress value in `useScrollStore.notebookProgress`. Skills uses its own section-local `skillsCover`, written by a Skills-specific ScrollTrigger that starts before Skills' natural top and ends at it (so the slide-in begins while the user is still scrolling through Notebook's tail). Global progress thresholds in scene/avatar code shift when section heights change — see "Reference scene constants" below.

| Range           | Section               | Orbit radius                      | Spin                                      | Avatar                                                                                                                                                                  | Camera                          |
| --------------- | --------------------- | --------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 0.00–0.04       | Hero                  | 4.0                               | idle drift (autonomous, no scroll needed) | centered, idle breathing, full opacity                                                                                                                                  | static, slight DoF on far logos |
| 0.04–0.08       | Hero → About          | lerp 4.0 → 1.5                    | scroll layers velocity onto idle drift    | drifts left to x ≈ −2.6, yaws 0 → ~36°; settled by progress ≈ 0.08                                                                                                      | small dolly-in                  |
| 0.083           | About pin             | 1.5                               | normal                                    | **pinned to About** in document space — the anchor's world-Y now tracks scroll so the avatar appears glued to that document position                                    | static                          |
| 0.083–0.1818    | About → Notebook      | 1.5                               | normal                                    | anchor translates up in world-Y at the same rate as page scroll; avatar scrolls off-screen above with the About section                                                 | static                          |
| 0.1818–0.8182   | **Notebook**          | n/a (avatar gone, orbit silent)   | n/a                                       | off-screen above; the pinned-to-About anchor keeps it there                                                                                                             | static — section is self-contained, see Notebook storyboard |
| 0.8182–0.9091   | Skills                | n/a (3D canvas idle)              | n/a                                       | off-screen above; pin holds                                                                                                                                             | static — section is HTML/CSS, slides over the laptop with its own section-local progress |
| 0.9091–1.00     | Experience → Contact  | 6.0, slow drift                   | idle                                      | off-screen above (pinned to About)                                                                                                                                      | pulls back                      |

Implementation note: the leftward translate + yaw are driven by `smoothstep(0.04, 0.08, progress)` (clamped at 1.0). The vertical pin is `anchor.position.y = max(0, progress − 0.083) × totalScrollPx / windowHeight × viewportWorldHeight` — i.e. the anchor matches scroll velocity in world units once About is centered, so the avatar appears stationary in document space. Together these signals leave the avatar settled at the left side of the About section, and it leaves the viewport upward as the user scrolls into Notebook.

Use `smoothstep(start, end, progress)` for transitions between bands so you don't get linear-ramp artifacts.

## Reference position function

```ts
function logoPosition(
  index: number,
  total: number,
  progress: number,
  time: number,
): [number, number, number] {
  const radius = lerp(4, 1.5, smoothstep(0.2, 0.35, progress));
  const idleSpin = time * 0.08; // autonomous slow drift, rad/s
  const scrollSpin = progress * 2; // scroll layers velocity on top
  const angle = (index / total) * Math.PI * 2 + idleSpin + scrollSpin;
  const tilt = Math.sin(progress * Math.PI * 2 + index) * 0.5;
  return [Math.cos(angle) * radius, tilt, Math.sin(angle) * radius];
}
```

In the component:

```tsx
useFrame(({ clock }) => {
  const p = useScrollStore.getState().progress;
  const [x, y, z] = logoPosition(index, total, p, clock.elapsedTime);
  meshRef.current.position.lerp(new Vector3(x, y, z), 0.1);
});
```

The `0.1` lerp factor is responsible for ~40% of how good the motion feels. Keep it.

## Section storyboards

**Hero (0.00–0.04)** — Soft neutral background, vignette, grain. Avatar centered. 10 logos orbit at r=4 with an autonomous slow drift (a full revolution every ~80s) so the scene feels alive even before the visitor scrolls. Each logo carries a small point light tinted to its brand color, so as it passes near the avatar it casts a colored glow on the nearest side. Headline overlay top-left: name + role.

**About (0.04–0.0909, then pinned)** — Avatar + orbit fly to the left of the viewport (x ≈ −2.6) and the avatar yaws ~36° into a 3/4 view facing the right side, where About copy reveals. The leftward motion completes by progress ≈ 0.08, just before About is vertically centred. From that point the anchor is **pinned to the About section** in document space: as the user scrolls further into Notebook/Skills/Experience/Contact, the avatar scrolls off-screen upward with About instead of staying in the viewport. It belongs to About; subsequent sections own their own visual treatment.

**Notebook (global 0.1818–0.8182, section-local `notebookProgress` 0.00–1.00)** — A 7×viewport-tall scroll-pinned interlude. The 3D canvas is silent here; the entire scene is HTML/CSS-driven. Section-local sub-phases (see [src/sections/notebook/notebook.constants.ts](../src/sections/notebook/notebook.constants.ts)):

| Sub-progress | What happens |
| --- | --- |
| 0.00–0.10 | Title `elevate your system` and notebook image enter the viewport together; both translate upward as the user scrolls. By 0.10 the notebook reaches the vertical centre of the viewport and pins. |
| 0.12–0.18 | Two macOS-Finder-style window boxes (red/yellow/green dots, black body) ease up from below the viewport to flank the notebook on the left and right. |
| 0.18–0.30 | Finder boxes hold visibly — typewriter fills their lines (`context.md` / `notes.md`). |
| 0.30–0.36 | Finder boxes ease out off the top of the viewport. |
| 0.36–0.46 | Notebook **scales** from small → fills the viewport (`width: min(100vw, 2000px)`, height keeps aspect, centred). Feels like the user's screen has been replaced by the laptop's screen. |
| 0.46–0.55 | "**plan**" types into the laptop screen (Typewriter), holds, fades. |
| 0.55–0.64 | "**build**" types in, holds, fades. |
| 0.64–0.73 | "**improve**" types in, holds, fades. |
| 0.73–0.83 | Notebook image lifts off the top of the viewport in ~1 viewport of scroll. |
| 0.71–end | Skills slides up over the (now-exiting) notebook — driven by its own section-local progress (`skillsCover`), see Skills storyboard. |

**Skills (global 0.8182–0.9091, section-local `skillsCover` 0.00–1.00)** — A 1×viewport-tall section. Section-local `skillsCover` is created by a Skills-specific ScrollTrigger that starts when Skills' top is `SKILLS_ENTRY_BEFORE_VH` (174vh) below the viewport bottom and ends when Skills' top reaches the viewport top. While `skillsCover` < `SKILLS_SLIDE_IN_RAMP` (~0.4) the section translates up from below the viewport (smoothstep ease-in). From that point until `skillsCover` = 1, the translateY tracks scroll so the inner stage stays at viewport top — a translate-driven pin lasting ~1.5 viewport-scrolls. Past `skillsCover` = 1, the section sits in its natural document position; further scroll lets it slide up out of viewport with Lenis's ease-out, and Experience scrolls in from below with no gap.

The visual: same dark canvas, floor is now a circuit board — faint cyan PCB traces tile the background, brightening under a pointer-driven spotlight. Scattered across the board sit ~50 microchip-style cards (matte-black DIP packages with silver-pin teeth, varying sizes, slight per-chip rotation). Each chip carries a skill name and a glowing progress bar — red ≤ 30, amber 31–60, green 61+. A small per-category indicator dot (Frontend / Backend / AI / DevOps) sits next to the label. Chips inside the spotlight radius lift slightly and their bar glow intensifies. Below 768 px the scatter collapses into a wrapping flex grid. Source of truth for the roster: `src/sections/skills/skills.data.ts`, derived from `docs/cv.md`.

**Experience (0.9167–0.96)** — unknowen yet

**Contact (0.96–1.00)** — Camera pulls back; full scene visible, gently drifting. CTA + email + LinkedIn link. Footer fades in.

## Reference scene constants

When the page-height composition changes (e.g. a section is added or its viewport-height multiplier changes), the global-progress thresholds in `src/scene/Scene.tsx`, `src/scene/Avatar.tsx`, and `src/scene/lib/logoPosition.ts` must be rebased. Conversion: take the document-space scroll position of an event (in vh), divide by total scroll range (in vh = total page height − 1vh). Long sections (≥ 2vh) should drive their internal choreography from a section-local progress value in `useScrollStore`, not the global one, so other sections aren't dragged through their phases as a long section grows.
