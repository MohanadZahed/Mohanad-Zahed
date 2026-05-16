# Vision — "The Orbit"

## Metaphor

You are the gravitational center. The tech stack orbits you like planets. Scrolling pulls the orbit through phases — chaos to order to dispersal — telling the story "I work with this whole ecosystem; here's how each piece fits."

It must feel calm and hypnotic, never aggressive. Soft rim lighting on the avatar, slight depth-of-field blur on the furthest logos, neutral palette with a vignette and subtle grain.

## Scroll timeline (0.00 → 1.00, normalised)

Section heights in viewport-units: Hero=1, About=1, **Notebook=6.25** (long pinned interlude), Skills=1, **Knowledge=3** (pinned interlude), **Certificates=3** (sticky horizontal-scroll interlude), **Experience≈16** (sticky-stacking project cards), Contact=1 ≈ 32.25 viewport-heights total, scroll range ≈ 31.25vh. Approximate section TOPS in global progress: Hero=0.00, About=0.032, Notebook=0.064, Skills=0.264, Knowledge=0.296, Certificates=0.392, Experience=0.488, Contact=0.968. About is centred in the viewport at progress ≈ 0.027. Experience's height is content-driven (sticky-stacking cards) so the exact ratio depends on per-card heights — treat the numbers above as nominal guides and use `ScrollTrigger.refresh()` measurements for anything that needs precision.

Because Notebook (7vh) spans more than one viewport, it drives its internal choreography from a section-local progress value in `useScrollStore.notebookProgress`. Skills uses its own section-local `skillsCover`, written by a Skills-specific ScrollTrigger that starts before Skills' natural top and ends at it (so the slide-in begins while the user is still scrolling through Notebook's tail). Certificates (3vh) drives its horizontal-scroll choreography from `useScrollStore.certificatesProgress`. Global progress thresholds in scene/avatar code shift when section heights change — see "Reference scene constants" below.

Approximate global-progress ranges (nominal — recompute from runtime measurement when precision matters):

| Range           | Section               | Orbit radius                      | Spin                                      | Avatar                                                                                                                                                                  | Camera                          |
| --------------- | --------------------- | --------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Hero state      | Hero                  | 4.0                               | idle drift (autonomous, no scroll needed) | anchor tracks `[data-avatar-anchor="hero"]` div, idle breathing, full opacity                                                                                           | static, slight DoF on far logos |
| Hero → About    | Hero → About          | lerp 4.0 → 1.5                    | scroll layers velocity onto idle drift    | anchor blends from hero div → about div as the about anchor scrolls into the viewport; yaws 0 → ~36° on the same blend                                                  | small dolly-in                  |
| About settled   | About                 | 1.5                               | normal                                    | anchor follows `[data-avatar-anchor="about"]` div in document space — the avatar tracks its bounding rect, so it scrolls off-screen upward with About naturally          | static                          |
| 0.064–0.264     | **Notebook**          | n/a (avatar gone, orbit silent)   | n/a                                       | off-screen above                                                                                                                                                        | static — see Notebook storyboard |
| 0.264–0.296     | Skills                | n/a (3D canvas idle)              | n/a                                       | off-screen above                                                                                                                                                        | HTML/CSS section with section-local progress |
| 0.296–0.392     | **Knowledge**         | n/a (orbit silent)                | n/a                                       | yoga avatar fades in, spins π → 0, continuous gentle float                                                                                                              | static — drives `knowledgeProgress` |
| 0.392–0.488     | **Certificates**      | n/a (orbit silent)                | n/a                                       | off-screen above (pinned to About)                                                                                                                                      | static — horizontal-scroll interlude, HTML-only |
| 0.488–0.968     | **Experience**        | n/a (orbit silent)                | n/a                                       | off-screen above (pinned to About)                                                                                                                                      | static — sticky-stacking project cards, HTML-only |
| 0.968–1.000     | Contact               | 6.0, slow drift                   | idle                                      | off-screen above (pinned to About)                                                                                                                                      | pulls back                      |

Implementation note (avatar position): the avatar's world position is **not** computed from per-breakpoint world-coordinate constants. Two zero-size hidden `<div data-avatar-anchor="...">` markers are placed by CSS — one in Hero, one in About — at the exact spots the avatar should occupy. Each frame the scene reads their `getBoundingClientRect()`, projects the rect centre into world space via `rectToWorld(rect, viewport)` ([src/scene/lib/projectAnchor.ts](../src/scene/lib/projectAnchor.ts)), and lerps the anchor group's `position.x/y` between the two world points. The blend `t` is driven by the About anchor's on-screen Y — `smoothstep(vh, vh × 0.3, aboutCenterFromTop)` — so `t = 0` when the about div is at viewport bottom and `t = 1` when it has scrolled up to 30% from the bottom. `t` is published to `useScrollStore.avatarBlend` so Avatar.tsx can drive yaw from the same signal. Past `t = 1` the avatar tracks the about div exclusively; because the div is a real DOM element in normal flow, its rect scrolls upward with the page, and the avatar leaves the viewport for free as Notebook arrives. Tuning the avatar's landing spot on a new screen size = editing the about anchor div's Tailwind classes, not Scene.tsx. The avatar mesh carries a constant `VISUAL_CENTER_OFFSET_Y = -0.9` ([src/scene/Avatar.tsx](../src/scene/Avatar.tsx)) so its torso (not its feet) sits at the anchor group's origin; the orbit group applies the same offset so logos stay co-centred with the avatar.

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

**About (anchor-driven, no global-progress thresholds)** — Avatar + orbit move from the Hero anchor div to the About anchor div and the avatar yaws ~36° into a 3/4 view facing the right side, where About copy reveals. The motion is driven by the About anchor's on-screen Y position (see Implementation note above): it completes when that div has scrolled to 30% from the viewport bottom. From that point the anchor tracks the About div in document space — as the user scrolls further into Notebook/Skills/Experience/Contact, the about div scrolls up out of the viewport in normal document flow and the avatar follows it for free. It belongs to About; subsequent sections own their own visual treatment.

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

**Certificates (global 0.392–0.488, section-local `certificatesProgress` 0.00–1.00)** — A 3×viewport-tall horizontal-scroll interlude that surfaces the professional certifications in [docs/content.md](content.md). The 3D canvas is silent (the avatar is still pinned off-screen above with About); the section is HTML/CSS only. Source data lives in [src/sections/certificates/certificates.data.ts](../src/sections/certificates/certificates.data.ts).

Structure: an outer section of `SECTION_VH = 300vh` contains a sticky stage (`position: sticky; top: 0; height: 100vh; overflow: hidden`). Inside the stage, a single horizontal `certificates-strip` lays out `[header block | cert 1 | cert 2 | cert 3 | cert 4 | cert 5]` left-to-right. The strip translates left as `certificatesProgress` advances. Cards alternate ±8° rotation (`index % 2 === 0 ? −8 : +8`) so the row reads like a stack of paper certificates.

| Sub-progress | What happens |
| --- | --- |
| 0.00–1.00 (sticky engaged) | Stage is sticky-pinned at viewport top for the full ScrollTrigger range (200vh of scroll, from section.top hitting viewport.top to section.bottom hitting viewport.bottom). Wheel scroll converts entirely to horizontal: the strip translates `0 → −X_visible`, where `X_visible = max(0, lastCardRight + sidePad − viewportW)` so the last card's right edge sits `sidePad` from the viewport right edge (fully visible, symmetric with the left padding). The header block scrolls off-screen left first; the user sees up to three cert cards at a time. |
| 1.00 → bottom (sticky released) | Sticky releases exactly when `progress` reaches 1, because the trigger's end (section.bottom = viewport.bottom) is also the sticky-release boundary. The strip stays at `−X_visible`. The stage scrolls upward out of the viewport in the natural document flow for the remaining 100vh of the section; Experience begins to enter the viewport from below. |

No GSAP `pin: true` needed — CSS sticky expresses the timing for free. The strip's translate is `x = lerp(0, X_visible, p)` — a single ramp that fills the entire sticky-engaged window, so there is no frozen-strip dead zone where the user scrolls but nothing moves. Below `STACK_BREAKPOINT_PX` (768 px) and under `prefers-reduced-motion`, the section degrades to a flat vertical flex-column of un-rotated cards.

**Experience (≈ 0.49 → 0.97)** — A long, content-driven section that takes the visitor through every job and project on the CV. The 3D canvas stays silent (the avatar is still pinned off-screen above with About); the entire choreography is HTML/CSS sticky-stacking. Source data lives in [src/data/experience.ts](../src/data/experience.ts).

Three **company wrappers** stack in reverse-chronological order — **ISO-Gruppe → Medienwerft → MERENTIS**. Each wrapper is a bordered, rounded panel whose company name sits *on* the top border at the left in fieldset legend style (`── ISO-Gruppe ──────`). Inside-top header: my role at the far left, city + timeline at the far right. Below the header, the wrapper hosts that company's project cards.

Each **project card** is a `position: sticky; top: 88px;` element (≥768px viewports). Cards are siblings within the wrapper, so as the user scrolls each card pins at the top in turn and later cards stack *over* earlier ones (later siblings paint on top in document order — no z-index needed). The `CategoryTag` (a small white tab on top of each card showing project number and date label) has a progressively-increasing `padding-left` per card index, so when N cards are stacked their tabs fan out left-to-right like file folders. The exact offset depends on project count — see `tagOffsetForProjectCount()` in [src/sections/experience/experience.constants.ts](../src/sections/experience/experience.constants.ts).

Card body content (full CV detail per project): role · project name · Kunde · Branche · Team-/Projektgröße · Umfeld (chip cluster) · multi-paragraph description · optional `link` CTA ("Visit live site") rendered only when the project has a public URL · AUFGABEN IM PROJEKT (bullet list).

**Cross-company hand-off:** the company wrapper itself is *not* sticky — it scrolls naturally. While inside Wrapper A, A's cards stack and pile up. When Wrapper A's bottom passes the viewport top, all of A's sticky cards release together and scroll up out of the viewport. Wrapper B (next company) then enters from below in normal document flow with its own first card, and the dance repeats.

Below the `STACK_BREAKPOINT_PX` (768 px) viewport, sticky positioning is dropped — cards become a vanilla flex-column with `gap-y` so the section remains readable as a static document on phones.

The 3D anchor stays pinned to About in document space throughout, so no scene work happens here. Global-progress thresholds in [src/scene/Scene.tsx](../src/scene/Scene.tsx), [src/scene/Avatar.tsx](../src/scene/Avatar.tsx), [src/scene/lib/logoPosition.ts](../src/scene/lib/logoPosition.ts), [src/sections/knowledge/knowledge.constants.ts](../src/sections/knowledge/knowledge.constants.ts), and [src/sections/certificates/certificates.constants.ts](../src/sections/certificates/certificates.constants.ts) are rebased against the ~31.25vh scroll range.

**Contact (0.968–1.000)** — Camera pulls back; full scene visible, gently drifting. Fixed height 750px. Three mini-me character images frame the section:

- **minime-coffee** (`/textures/minime-coffee.png`) — absolute, `top: -192px; left: 1.5rem; z-index: 100`, so it sits above the section edge appearing to "sit on" the top of the footer.
- **minime-truck** (`/textures/minime-truck.png`) — lives inline in the headline row; scroll-driven (section-local `contactProgress` 0..1, written by a `ScrollTrigger` on the headline row, `start: 'top 90%'`, `end: 'top 35%'`). At p=0 the truck is at x=0 (left edge) and the headline is hidden via `clip-path: inset(0 100% 0 0)`. As p→1 the truck translates rightward to `(rowWidth − truckWidth)` and the clip-path retracts to reveal the headline text, creating a "truck drives across, revealing the text" effect. Reduced motion: apply(1) on mount, skip ScrollTrigger. Size `w-24 sm:w-28 md:w-32`.
- **minime-programming** (`/textures/minime-programming.png`) — in document flow, centred between the FlipLink CTAs and the `© 2026` footer baseline, horizontally flipped (`-scale-x-100`). Size `w-28 sm:w-32 md:w-36`.

Content layout (centred column): headline (h2 `"Let's build something."`) with inline truck reveal → sub-copy → email link → FlipLink CTAs (`Get in touch` / `LinkedIn`) → programming minime → footer baseline (`© 2026 Mohanad Zahed` / `Built with React · Three.js · GSAP`).

`contactProgress` is written via `useScrollStore.getState().setContactProgress(self.progress)` in the ScrollTrigger `onUpdate` callback and applied via `useScrollStore.subscribe(...)` directly to DOM refs (no React re-renders). See [src/sections/Contact.tsx](../src/sections/Contact.tsx) and [src/store/useScrollStore.ts](../src/store/useScrollStore.ts).

## Reference scene constants

The avatar's Hero → About motion is **decoupled** from global progress — it reads two DOM anchor divs and the about div's on-screen Y, so adding/removing sections does not require rebasing avatar thresholds. The remaining global-progress thresholds in `src/scene/lib/logoPosition.ts` (orbit radius, spin, tilt) still need rebasing when page composition changes: take the document-space scroll position of an event (in vh), divide by total scroll range (in vh = total page height − 1vh). Long sections (≥ 2vh) should drive their internal choreography from a section-local progress value in `useScrollStore`, not the global one, so other sections aren't dragged through their phases as a long section grows.
