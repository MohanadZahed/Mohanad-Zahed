export const SECTION_VH = 300;

export const PHASE = {
  TITLE_TYPE_START: 0.0,
  TITLE_TYPE_END: 0.1,

  AVATAR_FADE_END: 0.1,
  AVATAR_SPIN_START: 0.1,
  AVATAR_SPIN_END: 0.4,

  BUBBLES_START: 0.4,
  BUBBLES_LAST_START: 0.65,
  BUBBLE_TRAVEL: 0.2,
  BUBBLES_HOLD: 0.85,
} as const;

// Beige backdrop pre-paint window, expressed as GSAP `top N%` scroller offsets
// for a trigger on the Knowledge section. The fade runs entirely while the
// section's top is still BELOW the viewport bottom (both values > 100), so the
// whole viewport is covered by Skills' opaque black content and the ramp is
// imperceptible — by the time Knowledge reveals the backdrop it is already
// solid. Lower START to paint even earlier in Skills; keep both > 100.
export const BEIGE_FADE_START_PCT = 185; // knowledge top ~0.85vh below viewport bottom
export const BEIGE_FADE_END_PCT = 120; // still 0.2vh below the bottom edge → fully covered

export const RING_RADIUS_MIN_PX = 280;
export const RING_RADIUS_MAX_PX = 320;
export const RING_ANGLE_JITTER_RAD = 0.06;

const MOBILE_BREAKPOINT_PX = 768;

// Ring geometry adapts to viewport size so the topmost bubbles never collide
// with the `Knowledge` title (pinned at top: 12vh) on short viewports, and the
// ring stays a ring (not a long stacked list) on narrow phones.
export function getRingGeometry(viewportW: number, viewportH: number): {
  minPx: number;
  maxPx: number;
  centerOffsetY: number;
  bubbleScale: number;
  // Horizontal stretch factor. The envelope is a superellipse with
  // rx = radius * aspectX and ry = radius. > 1 widens it so top/bottom
  // bubbles fan out along X.
  aspectX: number;
  // 'ellipse' = bubbles distributed by angle around an oval (desktop).
  // 'square'  = bubbles distributed by arc length along a rectangle perimeter
  //             (phones), so each edge fills evenly instead of clustering
  //             bubbles in the corners.
  layoutMode: 'ellipse' | 'square';
} {
  // Smoothstep helpers inlined to avoid importing src/scene/* into a section file.
  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
  const smoothstep = (edge0: number, edge1: number, x: number) => {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  if (viewportW < MOBILE_BREAKPOINT_PX) {
    // Phones: tight ring around the yoga avatar. The envelope is stretched
    // horizontally (aspectX > 1) so the top/bottom bubbles fan out along X
    // instead of stacking on each other — the result reads more like a
    // rounded rectangle than a circle, which is fine here.
    const k = smoothstep(360, 768, viewportW); // 0 at 360, 1 at 768
    return {
      // Y radius — kept compact so the ring stays close to the avatar.
      minPx: lerp(105, 170, k),
      maxPx: lerp(130, 200, k),
      centerOffsetY: 0,
      bubbleScale: lerp(0.7, 0.85, k),
      // Stretch X by ~1.45x on the narrowest phones, easing back toward 1.25x
      // by the tablet breakpoint. Bubble half-width on phones (~60px at
      // scale 0.7) plus 1.45 * 130 = ~250px → fits a 360px viewport.
      aspectX: lerp(1.45, 1.25, k),
      // Real rectangle perimeter on phones — bubbles walk the four edges so
      // each edge fills evenly. Reads as a square frame around the avatar.
      layoutMode: 'square',
    };
  }

  // Desktop / tablet wide. Shrink and drop the ring centre on short heights so
  // the topmost bubble keeps clearance under the title. A small horizontal
  // stretch helps even at full size where bubbles are widest.
  const kH = smoothstep(800, 1000, viewportH);
  return {
    minPx: lerp(220, RING_RADIUS_MIN_PX, kH),
    maxPx: lerp(250, RING_RADIUS_MAX_PX, kH),
    centerOffsetY: lerp(40, 0, kH),
    bubbleScale: 1,
    aspectX: lerp(1.15, 1.05, kH),
    layoutMode: 'ellipse',
  };
}

// Global progress band where the YogaAvatar is on stage.
// Page composition: Hero(1) + About(1) + Manifesto(6.9) + Skills(2.2 box, −2.18 overlap)
// + Knowledge(3) + Certificates(3) + Experience(~16) + Contact(1) → scroll range ≈ 32.77vh.
// NOTE: these derived markers are nominal and currently unused in code (Knowledge runs
// off section-local knowledgeProgress/knowledgeApproach). Kept directionally correct only.
// TOP   = section TOP at viewport BOTTOM (avatar starts rising from below).
// CENTER = section TOP at viewport TOP (sticky pins, avatar at viewport centre).
// PIN_END = ScrollTrigger end ('bottom bottom'), knowledgeProgress reaches 1.
// BOTTOM  = section BOTTOM at viewport TOP (section fully scrolled out).
const SCROLL_RANGE_VH = 32.77;
export const KNOWLEDGE_TOP_PROGRESS = 10.12 / SCROLL_RANGE_VH;
export const KNOWLEDGE_CENTER_PROGRESS = 11.12 / SCROLL_RANGE_VH;
export const KNOWLEDGE_PIN_END_PROGRESS = 13.78 / SCROLL_RANGE_VH;
export const KNOWLEDGE_BOTTOM_PROGRESS = 14.47 / SCROLL_RANGE_VH;
