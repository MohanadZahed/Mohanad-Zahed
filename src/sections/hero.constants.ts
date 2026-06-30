// Hero intro schedule — absolute time positions (seconds from `heroStartedAt`,
// the shared intro clock set once the WebGL scene is ready; see App.tsx).
// The DOM intro (HeroLogo) and the canvas layers (Avatar fade, logo-ring expand,
// HeroBackground SVG fly-in) all key off this one origin, so ordering is purely
// these constants. Tune the whole intro here.

// Phase 1 — four crosshair lines draw out from the centre, framing a 110px square.
export const HERO_LINES_DELAY = 0.2;
export const HERO_LINES_DUR = 0.7; // → square formed ~0.9

// Phase 2 — the gold "O" flickers in inside the square.
export const HERO_O_FLICKER_DELAY = 0.95;
export const HERO_O_FLICKER_DUR = 0.6; // → O solid ~1.55

// Phase 3 — lines + O travel up-left to the O's resting slot in the name.
export const HERO_O_TRAVEL_DELAY = 1.65;
export const HERO_O_TRAVEL_DUR = 0.85; // → O placed ~2.5

// Phase 4 — the crosshair lines fade out once the O is placed.
export const HERO_LINES_FADE_DELAY = 2.35;
export const HERO_LINES_FADE_DUR = 0.4;

// Phase 5 — circuit underline draws while the rest of the name letters appear.
// A single 0..1 driver (`introLetters`) is tweened over this window; the
// underline sub-beats (vertical → node → segments → end circles) and the
// per-letter reveal are sliced out of it inside HeroLogo.
export const HERO_BUILD_DELAY = 2.5;
export const HERO_BUILD_DUR = 1.5; // → name fully composed ~4.0

// Phase 6 — supporting copy.
export const HERO_TITLE_DELAY = 4.0;
export const HERO_TITLE_DUR = 0.8;
export const HERO_TAGLINE_DELAY = 4.5;
export const HERO_TAGLINE_DUR = 0.8;

// Background SVG fly-in (consumed by HeroBackground) — lands after the name
// builds so the construction beats read against an empty dark stage.
export const HERO_SVG_DELAY = 2.6;
export const HERO_SVG_DUR = 0.7;
export const HERO_SVG_STAGGER = 0.008; // ~52 icons → ~0.42s spread

// Phase 7 — 3D avatar + tech ring fade in last (consumed by Avatar / LogoPlane).
export const AVATAR_FADE_START = 5.0;
export const AVATAR_FADE_END = 5.8;
export const LOGO_FADE_START = 5.7;
export const LOGO_FADE_END = 6.4;

// === Scroll-scrubbed collapse → corner logo (hero → about) ===
// Hero-exit progress (0..1). First the name collapses into "MOZ" (trailing
// letters fade + close up, Z gathers toward "MO", underline right shrinks).
// The park is two-stage: the mark RISES to the top (and shrinks) while it is
// still collapsing, then SLIDES LEFT into the corner.
// Fraction of the hero section's scroll height over which the whole collapse
// completes — smaller = the mark forms + parks earlier and faster as you scroll.
export const HERO_COLLAPSE_DISTANCE_FRAC = 0.45;
export const HERO_COLLAPSE_FORM_END = 0.55;
export const HERO_PARK_UP_START = 0.15;
export const HERO_PARK_UP_END = 0.6;
export const HERO_PARK_LEFT_START = 0.62;
export const HERO_PARK_LEFT_END = 1.0;

// Dark backdrop geometry — shared between HeroLogo (renders the backdrop div)
// and MozNav (restores border-radius on menu close).
export const BACKDROP_RADIUS = 22;

// Parked MOZ mark grows while its nav menu is open (fine pointers only) so the
// dropdown reads at full weight; shrinks back to the parked scale on close.
export const MENU_OPEN_SCALE = 1; // nameWrap scale while the nav menu is open
// The mark grows anchored at its parked top-left corner (origin 0 0), nudged by
// this small offset (px, relative to the parked corner) when the menu opens —
// NOT an absolute translate, which would fling the mark toward its natural
// centered column position. The dropdown auto-aligns since it's measured from
// the mark's live backdrop rect after the grow completes.
export const MENU_OPEN_DX = 8;
export const MENU_OPEN_DY = 8;
export const MENU_SCALE_DUR = 0.28; // grow/shrink duration (s)
