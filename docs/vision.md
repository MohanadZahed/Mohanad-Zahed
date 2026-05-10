# Vision — "The Orbit"

## Metaphor

You are the gravitational center. The tech stack orbits you like planets. Scrolling pulls the orbit through phases — chaos to order to dispersal — telling the story "I work with this whole ecosystem; here's how each piece fits."

It must feel calm and hypnotic, never aggressive. Soft rim lighting on the avatar, slight depth-of-field blur on the furthest logos, neutral palette with a vignette and subtle grain.

## Scroll timeline (0.00 → 1.00, normalised)

Section heights in viewport-units: Hero=1, About=1, **Notebook=6.25** (long pinned interlude), Skills=1, **Knowledge=3** (pinned interlude), **Experience≈16** (sticky-stacking project cards), Contact=1 ≈ 29.25 viewport-heights total, scroll range ≈ 28.25vh. Approximate section TOPS in global progress: Hero=0.00, About=0.035, Notebook=0.071, Skills=0.292, Knowledge=0.327, Experience=0.434, Contact=0.965. About is centred in the viewport at progress ≈ 0.030. Experience's height is content-driven (sticky-stacking cards) so the exact ratio depends on per-card heights — treat the numbers above as nominal guides and use `ScrollTrigger.refresh()` measurements for anything that needs precision.

Because Notebook (7vh) spans more than one viewport, it drives its internal choreography from a section-local progress value in `useScrollStore.notebookProgress`. Skills uses its own section-local `skillsCover`, written by a Skills-specific ScrollTrigger that starts before Skills' natural top and ends at it (so the slide-in begins while the user is still scrolling through Notebook's tail). Global progress thresholds in scene/avatar code shift when section heights change — see "Reference scene constants" below.

Approximate global-progress ranges (nominal — recompute from runtime measurement when precision matters):

| Range           | Section               | Orbit radius                      | Spin                                      | Avatar                                                                                                                                                                  | Camera                          |
| --------------- | --------------------- | --------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 0.000–0.014     | Hero                  | 4.0                               | idle drift (autonomous, no scroll needed) | centered, idle breathing, full opacity                                                                                                                                  | static, slight DoF on far logos |
| 0.014–0.030     | Hero → About          | lerp 4.0 → 1.5                    | scroll layers velocity onto idle drift    | drifts left to x ≈ −2.6, yaws 0 → ~36°; settled by progress ≈ 0.030                                                                                                     | small dolly-in                  |
| 0.030           | About pin             | 1.5                               | normal                                    | **pinned to About** in document space — anchor's world-Y now tracks scroll                                                                                              | static                          |
| 0.030–0.071     | About → Notebook      | 1.5                               | normal                                    | scrolls off-screen above with About                                                                                                                                     | static                          |
| 0.071–0.292     | **Notebook**          | n/a (avatar gone, orbit silent)   | n/a                                       | off-screen above                                                                                                                                                        | static — see Notebook storyboard |
| 0.292–0.327     | Skills                | n/a (3D canvas idle)              | n/a                                       | off-screen above                                                                                                                                                        | HTML/CSS section with section-local progress |
| 0.327–0.434     | **Knowledge**         | n/a (orbit silent)                | n/a                                       | yoga avatar fades in, spins π → 0, continuous gentle float                                                                                                              | static — drives `knowledgeProgress` |
| 0.434–0.965     | **Experience**        | n/a (orbit silent)                | n/a                                       | off-screen above (pinned to About)                                                                                                                                      | static — sticky-stacking project cards, HTML-only |
| 0.965–1.000     | Contact               | 6.0, slow drift                   | idle                                      | off-screen above (pinned to About)                                                                                                                                      | pulls back                      |

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
| 0.16–0.28 | `Typewriter` fills the finder box lines (`context.md` / `notes.md`) **scroll-driven**: each box maps `[FINDER_TYPING_START=0.16, FINDER_TYPING_END=0.28]` to 0..1 and slices that across its `n` lines (line `i` types over `[i/n, (i+1)/n]`). Characters appear and disappear in lockstep with scroll — typing starts while the boxes are still sliding in (0.12–0.18) and finishes while they hold. |
| 0.28–0.30 | Finder boxes hold fully typed. |
| 0.30–0.36 | Finder boxes ease out off the top of the viewport. |
| 0.36–0.46 | Notebook **scales** from small → fills the viewport (`width: min(100vw, 2000px)`, height keeps aspect, centred). Feels like the user's screen has been replaced by the laptop's screen. |
| 0.46–0.55 | "**plan**" types into the laptop screen — `Typewriter` in scroll-driven mode over `PLAN_TYPE_IN = [0.46, 0.49]`, then holds to `0.53`, fades to `0.55`. |
| 0.55–0.64 | "**build**" — same pattern, types over `[0.55, 0.58]`, holds to `0.62`, fades to `0.64`. |
| 0.64–0.73 | "**improve**" — types over `[0.64, 0.67]`, holds to `0.71`, fades to `0.73`. |
| 0.73–0.83 | Notebook image lifts off the top of the viewport in ~1 viewport of scroll. |
| 0.71–end | Skills slides up over the (now-exiting) notebook — driven by its own section-local progress (`skillsCover`), see Skills storyboard. |

**Skills (global 0.8182–0.9091, section-local `skillsCover` 0.00–1.00)** — A 1×viewport-tall section. Section-local `skillsCover` is created by a Skills-specific ScrollTrigger that starts when Skills' top is `SKILLS_ENTRY_BEFORE_VH` (174vh) below the viewport bottom and ends when Skills' top reaches the viewport top. While `skillsCover` < `SKILLS_SLIDE_IN_RAMP` (~0.4) the section translates up from below the viewport (smoothstep ease-in). From that point until `skillsCover` = 1, the translateY tracks scroll so the inner stage stays at viewport top — a translate-driven pin lasting ~1.5 viewport-scrolls. Past `skillsCover` = 1, the section sits in its natural document position; further scroll lets it slide up out of viewport with Lenis's ease-out, and Experience scrolls in from below with no gap.

The visual: same dark canvas, floor is now a circuit board — faint cyan PCB traces tile the background, brightening under a pointer-driven spotlight. Scattered across the board sit ~50 microchip-style cards (matte-black DIP packages with silver-pin teeth, varying sizes, slight per-chip rotation). Each chip carries a skill name and a glowing progress bar — red ≤ 30, amber 31–60, green 61+. A small per-category indicator dot (Frontend / Backend / AI / DevOps) sits next to the label. Chips inside the spotlight radius lift slightly and their bar glow intensifies. Below 768 px the scatter collapses into a wrapping flex grid. Source of truth for the roster: `src/sections/skills/skills.data.ts`, derived from `docs/cv.md`.

**Header & legend.** Above the scatter, the section header (`Skills` h2 + tagline) is followed by a vertically-stacked category legend listing **Frontend / Backend / DevOps / AI**. Each legend row is a colored dot (same hex as the chip's `--cat-color`: frontend `#38bdf8`, backend `#a78bfa`, devops `#f59e0b`, ai `#34d399`) followed by an uppercase mono label. The legend dots use the chip dot's lit-state glow (`0 0 6px var(--cat-color), 0 0 12px color-mix(... 60%)`) **at all times** — no hover transition, they stay illuminated as a static key.

**Chip grouping.** Chips are not a single uniform scatter. The roster is split by category into four separate grid blocks rendered in this order — **Frontend → Backend → DevOps → AI** — stacked vertically with `gap-16` between groups. Each block is its own `repeat(8, minmax(0, 1fr))` grid with a tighter inner `gap` (≈ 6 spacing units) and `gridAutoFlow: 'dense'`, so chips of the same category visually cluster together while keeping the scattered, varied-size feel within a group. Category render order lives in `CATEGORY_ORDER` inside `src/sections/skills/ChipScatter.tsx`.

**Knowledge (global 0.7143–0.9286, section-local `knowledgeProgress` 0.00–1.00)** — A 3×viewport-tall pinned interlude that complements Skills. Skills shows the *stack*; Knowledge shows the *practice* — methodologies, architectural concepts, and soft skills that don't fit a tech chip. The 3D canvas hosts a second avatar (`/models/avatar-yoga.glb`) sitting in an om pose at world origin; the orbit is silent here. Section-local sub-phases (constants in [src/sections/knowledge/knowledge.constants.ts](../src/sections/knowledge/knowledge.constants.ts)):

| Sub-progress | What happens |
| --- | --- |
| 0.00–0.10 | Title `Knowledge` types in via scroll-driven `Typewriter`. Yoga avatar fades in (driven by global progress crossing into the Knowledge band) showing his back (`rotation.y = π`). Bubbles hidden. |
| 0.10–0.40 | Avatar rotates `π → 0` via `smoothstep(0.10, 0.40, p)` (damped); he ends facing the camera. Continuous gentle float on `position.y` (`sin(t·0.5)·0.04`). |
| 0.40–0.85 | 22 glassy HTML knowledge bubbles emerge from viewport centre and travel outward to a soft ring (radius 220–320 px) around the avatar. Per-bubble window: `start = lerp(0.40, 0.65, i/(total−1))`, `end = start + 0.20` — staggered cascade. |
| 0.85–1.00 | Hold fully composed; section unpins and Experience scrolls in below. |

**Experience (≈ 0.43 → 0.97)** — A long, content-driven section that takes the visitor through every job and project on the CV. The 3D canvas stays silent (the avatar is still pinned off-screen above with About); the entire choreography is HTML/CSS sticky-stacking. Source data lives in [src/data/experience.ts](../src/data/experience.ts).

Three **company wrappers** stack in reverse-chronological order — **ISO-Gruppe → Medienwerft → MERENTIS**. Each wrapper is a bordered, rounded panel whose company name sits *on* the top border at the left in fieldset legend style (`── ISO-Gruppe ──────`). Inside-top header: my role at the far left, city + timeline at the far right. Below the header, the wrapper hosts that company's project cards.

Each **project card** is a `position: sticky; top: 88px;` element (≥768px viewports). Cards are siblings within the wrapper, so as the user scrolls each card pins at the top in turn and later cards stack *over* earlier ones (later siblings paint on top in document order — no z-index needed). The `CategoryTag` (a small white tab on top of each card showing project number and date label) has a progressively-increasing `padding-left` per card index, so when N cards are stacked their tabs fan out left-to-right like file folders. The exact offset depends on project count — see `tagOffsetForProjectCount()` in [src/sections/experience/experience.constants.ts](../src/sections/experience/experience.constants.ts).

Card body content (full CV detail per project): role · project name · Kunde · Branche · Team-/Projektgröße · Umfeld (chip cluster) · multi-paragraph description · optional `link` CTA ("Visit live site") rendered only when the project has a public URL · AUFGABEN IM PROJEKT (bullet list).

**Cross-company hand-off:** the company wrapper itself is *not* sticky — it scrolls naturally. While inside Wrapper A, A's cards stack and pile up. When Wrapper A's bottom passes the viewport top, all of A's sticky cards release together and scroll up out of the viewport. Wrapper B (next company) then enters from below in normal document flow with its own first card, and the dance repeats.

Below the `STACK_BREAKPOINT_PX` (768 px) viewport, sticky positioning is dropped — cards become a vanilla flex-column with `gap-y` so the section remains readable as a static document on phones.

The 3D anchor stays pinned to About in document space throughout, so no scene work happens here. Global-progress thresholds in [src/scene/Scene.tsx](../src/scene/Scene.tsx), [src/scene/Avatar.tsx](../src/scene/Avatar.tsx), [src/scene/lib/logoPosition.ts](../src/scene/lib/logoPosition.ts), and [src/sections/knowledge/knowledge.constants.ts](../src/sections/knowledge/knowledge.constants.ts) are rebased against the new ~28.25vh scroll range.

**Contact (0.96–1.00)** — Camera pulls back; full scene visible, gently drifting. CTA + email + LinkedIn link. Footer fades in.

## Reference scene constants

When the page-height composition changes (e.g. a section is added or its viewport-height multiplier changes), the global-progress thresholds in `src/scene/Scene.tsx`, `src/scene/Avatar.tsx`, and `src/scene/lib/logoPosition.ts` must be rebased. Conversion: take the document-space scroll position of an event (in vh), divide by total scroll range (in vh = total page height − 1vh). Long sections (≥ 2vh) should drive their internal choreography from a section-local progress value in `useScrollStore`, not the global one, so other sections aren't dragged through their phases as a long section grows.
