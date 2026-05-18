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
| 0.296–0.392     | **Knowledge**         | n/a (orbit silent)                | n/a                                       | beige `--color-quaternary` backdrop (fade-in driven by global progress during late Skills), black disc falls from top and expands to a corner-filling rectangle that **persists past Knowledge into Certificates**; yoga avatar fades in, spins π → 0, continuous gentle float; seven sky-blue math-pattern SVGs burst from arc centre to their upper-ellipse anchors in lockstep with the disc, rest at 0.3 opacity (cursor proximity lifts to 1) | static — drives `knowledgeProgress` |
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
| 0.00–0.08 | Title `elevate your system` and notebook image enter the viewport together; both translate upward as the user scrolls. By 0.08 the notebook reaches the vertical centre of the viewport and pins. A muted, looping `<video>` (`/videos/notebook-video.{webm,mp4}`) sits *behind* the laptop image inside `SCREEN_RECT` and plays through the transparent screen cut-out — so the laptop feels alive the moment it lands. |
| 0.08–0.21 | **Box 0 (`architecture.md`, left)** rises from below the viewport, types `_Modular design / _Clean architecture / _Scalable solutions` while ascending (typing completes at the window midpoint as the box passes the vertical centre), holds fully-typed, then exits off the top. Driven by a per-box scroll window `FINDER_BOX_RANGES[0] = [0.08, 0.21]`. |
| 0.16–0.29 | **Box 1 (`delivery.md`, right)** begins rising while Box 0 is still ~30% from the viewport top. Types `_Rapid delivery / _Value-focused delivery / _Stakeholder alignment`. Window `FINDER_BOX_RANGES[1] = [0.16, 0.29]`. |
| 0.24–0.37 | **Box 2 (`quality.md`, left)** begins rising while Box 1 is still ~30% from the viewport top. Types `_High-quality output / _Best practices driven / _Performance optimization`. Window `FINDER_BOX_RANGES[2] = [0.24, 0.37]`. By the end of this window the last box has cleared the top of the viewport. |
| 0.33–0.37 | A black "terminal" rectangle scales `0 → 1` out of the screen's bottom-right corner (`transformOrigin: bottom right`, driven by `smoothstep(TERMINAL_OPEN_START=0.33, TERMINAL_OPEN_END=0.37, p)`), covering the looping video by the time scaling begins. Once fully covered, the video element is `pause()`d. The rectangle lives inside the notebook wrapper sized in `%` of `SCREEN_RECT`, so it scales with the laptop image for free in the next phase. |
| 0.37–0.47 | Notebook **scales** from small → fills the viewport (`width: min(100vw, 2000px)`, height keeps aspect, centred). Feels like the user's screen has been replaced by the laptop's screen. The black terminal rectangle is now full-size and scales up with the wrapper. Scale-up begins exactly as Box 2 finishes leaving the viewport. |
| 0.47–0.56 | "**plan**" types into the laptop screen — `Typewriter` in scroll-driven mode over `PLAN_TYPE_IN = [0.47, 0.50]`, then holds to `0.54`, fades to `0.56`. Now reads as text typed into the black terminal. |
| 0.56–0.65 | "**build**" — same pattern, types over `[0.56, 0.59]`, holds to `0.63`, fades to `0.65`. |
| 0.65–0.74 | "**improve**" — types over `[0.65, 0.68]`, holds to `0.72`, fades to `0.74`. |
| 0.74–0.87 | Notebook image lifts off the top of the viewport in ~1 viewport of scroll. |
| 0.71–end | Skills slides up over the (now-exiting) notebook — driven by its own section-local progress (`skillsCover`), see Skills storyboard. |

On mobile (`viewport.w < 768`), the boxes keep their scroll-driven sequential motion at a fixed compact size (`width = min(268, viewport.w − 32)`, `height = width × 0.55` — ≈ 268 × 147 on most phones) and hard-anchor to the viewport edge for their side (Box 0/2 at `left: 12px`, Box 1 at `right: 12px`). They are explicitly allowed to overlap the small notebook image during their windows (z-index 30 over the notebook image).

**Skills (global 0.8182–0.9091, section-local `skillsCover` 0.00–1.00)** — A 1×viewport-tall section. Section-local `skillsCover` is created by a Skills-specific ScrollTrigger that starts when Skills' top is `SKILLS_ENTRY_BEFORE_VH` (174vh) below the viewport bottom and ends when Skills' top reaches the viewport top. While `skillsCover` < `SKILLS_SLIDE_IN_RAMP` (~0.4) the section translates up from below the viewport (smoothstep ease-in). From that point until `skillsCover` = 1, the translateY tracks scroll so the inner stage stays at viewport top — a translate-driven pin lasting ~1.5 viewport-scrolls. Past `skillsCover` = 1, the section sits in its natural document position; further scroll lets it slide up out of viewport with Lenis's ease-out, and Experience scrolls in from below with no gap.

The visual: same dark canvas, floor is now a circuit board — faint cyan PCB traces tile the background, brightening under a pointer-driven spotlight. Scattered across the board sit ~50 microchip-style cards (matte-black DIP packages with silver-pin teeth, varying sizes, slight per-chip rotation). Each chip carries a skill name and a glowing progress bar — red ≤ 30, amber 31–60, green 61+. A small per-category indicator dot (Frontend / Backend / AI / DevOps) sits next to the label. Chips inside the spotlight radius lift slightly and their bar glow intensifies. Below 768 px the scatter collapses into a wrapping flex grid. Source of truth for the roster: `src/sections/skills/skills.data.ts`, derived from `docs/cv.md`.

**Header & legend.** Above the scatter, the section header (`Skills` h2 + tagline) is followed by a vertically-stacked category legend listing **Frontend / Backend / DevOps / AI**. Each legend row is a colored dot (same hex as the chip's `--cat-color`: frontend `#38bdf8`, backend `#a78bfa`, devops `#f59e0b`, ai `#34d399`) followed by an uppercase mono label. The legend dots use the chip dot's lit-state glow (`0 0 6px var(--cat-color), 0 0 12px color-mix(... 60%)`) **at all times** — no hover transition, they stay illuminated as a static key.

**Chip grouping.** Chips are not a single uniform scatter. The roster is split by category into four separate grid blocks rendered in this order — **Frontend → Backend → DevOps → AI** — stacked vertically with `gap-16` between groups. Each block is its own `repeat(8, minmax(0, 1fr))` grid with a tighter inner `gap` (≈ 6 spacing units) and `gridAutoFlow: 'dense'`, so chips of the same category visually cluster together while keeping the scattered, varied-size feel within a group. Category render order lives in `CATEGORY_ORDER` inside `src/sections/skills/ChipScatter.tsx`.

**Knowledge (global 0.7143–0.9286, section-local `knowledgeProgress` 0.00–1.00)** — A 3×viewport-tall pinned interlude that complements Skills. Skills shows the *stack*; Knowledge shows the *practice* — methodologies, architectural concepts, and soft skills that don't fit a tech chip. The 3D canvas hosts a second avatar (`/models/avatar-yoga.glb`) sitting in an om pose at world origin; the orbit is silent here. Behind the yogi, seven sky-blue math-pattern SVGs (`/textures/math1.svg` … `/textures/math7.svg`) form an upper-ellipse arc (`MathBackdrop` in [src/scene/MathBackdrop.tsx](../src/scene/MathBackdrop.tsx)) — material tint is `#38bdf8` (lifts to `#bae6fd` on cursor proximity), normal blending, rest opacity `0.3` (cursor proximity lifts to `1`); each plane idle-bobs / rotates ±25° / scale-breathes on its own phase, parallaxes away from the cursor, and shows a sky-blue radial halo when the pointer approaches it. The SVG fills themselves are baked white so the material colour can tint freely; `math3.svg` keeps its original line-art via an inverted `feColorMatrix` filter (white-key + RGB invert) so its empty-circle-with-axes shape doesn't fill in solid.

**Backdrop choreography** is owned by [`KnowledgeBackground`](../src/sections/knowledge/KnowledgeBackground.tsx) — a single fixed div at `-z-20` whose `background-color` is `color-mix(in srgb, var(--color-quaternary) Xpct%, transparent)` (alpha, **not** element opacity, so the disc child isn't cascaded into the fade). `Xpct` ramps `0 → 100` via `smoothstep(0.245, KNOWLEDGE_TOP_PROGRESS, useScrollStore.progress)`, so beige only paints once Skills is on stage and stays painted forever after (hidden behind the opaque disc, but reversible if the user scrolls back up). Inside the wrapper, a centred disc holds a solid-black radial gradient. The disc:

- Falls from `−120vh` → `0` translateY over `[AVATAR_SPIN_START=0.10, AVATAR_SPIN_END=0.40]` of section progress.
- Grows from `80px` → `vmax × 2.6` over `[BUBBLES_START=0.40, BUBBLES_HOLD=0.85]`.
- Lerps its `border-radius` from `50% → 0%` over `smoothstep(0.6, 1.0, expand)` so the bounding box (already larger than the viewport) fills the corners as a hard rectangle by the end of the expansion.
- Opacity is just `fadeIn = smoothstep(0.10, 0.13, p)` — **no exit fade**. Once expanded the disc stays opaque black, so the black backdrop persists into Certificates (Experience / Contact paint over it with their own content). Scrolling back up shrinks the disc out via `fadeIn` going back to `0`.

The title (`KnowledgeStage.tsx`) reads `var(--knowledge-ink)`, which lerps from `rgb(0, 65, 109)` (brand navy, dark-on-beige) → `rgba(245, 241, 218, 0.95)` (cream, light-on-black) across `[INK_SHIFT_START=0.45, INK_SHIFT_END=0.60]` of section progress, so it stays readable across the beige→black transition.

Section-local sub-phases (constants in [src/sections/knowledge/knowledge.constants.ts](../src/sections/knowledge/knowledge.constants.ts)):

| Sub-progress | What happens |
| --- | --- |
| 0.00–0.10 | Title `Knowledge` types in via scroll-driven `Typewriter` (dark navy on beige). Yoga avatar fades in (driven by global progress crossing into the Knowledge band) showing his back (`rotation.y = π`). Math SVGs clustered at arc centre, opacity 0. Black disc still above the viewport, `fadeIn` just starting to ramp. Bubbles hidden. |
| 0.10–0.40 | Avatar rotates `π → 0` via `smoothstep(0.10, 0.40, p)` (damped); he ends facing the camera. Continuous gentle float on `position.y` (`sin(t·0.5)·0.04`). Black disc completes its fall to viewport centre. Math SVGs still clustered. |
| 0.40–0.85 | Black disc grows from 80px → corner-filling rectangle; `border-radius` lerps to `0` over the last 40% of the expansion. The seven math SVGs interpolate their world position from `(0, ARC_CENTER_Y)` → `(anchorX, anchorY)` and fade in to rest opacity `0.3`, in lockstep with the disc. 22 glassy HTML knowledge bubbles emerge from viewport centre and travel outward to a soft ring (radius 220–320 px) around the avatar. Per-bubble window: `start = lerp(0.40, 0.65, i/(total−1))`, `end = start + 0.20`. Title crossfades to cream over `[0.45, 0.60]`. |
| 0.85–1.00 | Hold fully composed; section unpins and Experience scrolls in below. Disc stays opaque, beige bg stays painted — both hidden behind subsequent section content. |

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
