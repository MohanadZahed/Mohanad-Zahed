// Skills "emerge from the laptop screen" choreography.
//
// The Manifesto section (690svh) pins its laptop full-size from its section-local
// progress 0.47 to 1.0. Skills is pulled up with a negative margin so its GSAP-
// pinned intro engages while the laptop is still pinned and full-size (just
// after the plan/build/improve words fade at manifesto-progress 0.74).
//
// While pinned, the Skills content (its real, full-height self) is clipped to the
// laptop's SCREEN_RECT and scrolls UP inside it (the header rises from the bottom
// of the screen), then the screen rect + content scale up to fill the whole
// viewport. At pin release the content is at identity (top-of-section at viewport
// top) so it hands off seamlessly to a NORMAL full-height scroll — no content is
// permanently cropped; the chips below the fold scroll in normally afterward.
//
// Timing/tuning constants — adjust by feel in the dev server. svh units.

// Negative top margin (svh) that overlaps Skills onto the manifesto tail. Sized so
// the pin engages ~manifesto-progress 0.80: manifesto bottom = top + 690svh; engage
// scroll ≈ 0.80 * (690 - 100) ≈ 472svh past the manifesto top → margin ≈ 472 - 690.
export const SKILLS_OVERLAP_VH = 218;

// Pinned scroll budget (svh) for the whole emerge + zoom. The pin releases after
// this much scroll; chosen so the zoom completes ~as the manifesto unpins (≈590svh).
export const INTRO_SCROLL_VH = 118;

// Sub-windows over the section-local `skillsIntro` (0..1, across INTRO_SCROLL_VH).
export const EMERGE_END = 0.3; // header slides up inside the (fixed) screen rect
export const ZOOM_START = 0.3; // screen rect + content begin scaling to viewport
export const ZOOM_END = 1.0; // fills the viewport exactly at pin release (seamless)

// Dithered "pixel frame" drawn around the section during the zoom (see
// SkillsPixelFrame.tsx). A band of black squares hugs the growing reveal window,
// grows in cell size as it scales toward the user, and rides off the viewport
// edges as the section fills the screen. Inner ring is dense/solid, outer rings
// dissolve into scattered squares (a "ragged dissolve" edge); per-pixel opacity
// varies (dither texture); a scattered subset shimmers — but only while the user
// is actively scrolling (opacity is a pure function of scroll position). All tunable.
export const PIXEL_LAYERS = 4; // frame thickness in cells (concentric square rings)
// Fixed cell size — the pixels do NOT scale with the zoom (min === max).
export const PIXEL_CELL_MIN_PX = 16; // cell size when the zoom just started
export const PIXEL_CELL_MAX_PX = 16; // cell size as it scales toward the viewport edge
export const PIXEL_GAP_PX = 0; // gutter between cells (0 = pixels tile seamlessly, no gap)
// How far the frame is allowed to paint INTO the section edge. The content (on
// top) masks the overlap where it exists; at the fractional window edge it fills
// the hairline seam between the CSS-clipped section and the canvas frame.
export const PIXEL_EDGE_OVERLAP_PX = 4;
export const PIXEL_MAX_ALPHA = 1; // peak pixel opacity
export const PIXEL_FADE_IN_Z = 0.035; // z range over which the frame fades in (smaller = snappier)
export const PIXEL_DONE_Z = 0.97; // beyond this z the band is off-screen → stop drawing

// Full opacity oscillations a fluctuating pixel sweeps as scroll drives z 0→1.
export const PIXEL_OSC_CYCLES = 6;

// The dark→faded gradient is CONTINUOUS across the band, not stepped per ring —
// driven by `d`, the normalised distance from the section edge (0 = hugging the
// section, 1 = outer edge of the band). This avoids the visible "sudden" jump a
// 4-step lookup produced. All three quantities lerp from an inner to an outer
// endpoint; `PIXEL_FADE_CURVE` (>1) keeps the inner band dark a little longer
// before it falls off.
export const PIXEL_FADE_CURVE = 5.4;
// Opacity: solid black at the edge → faded at the outer band.
export const PIXEL_INNER_OPACITY = 1;
export const PIXEL_OUTER_OPACITY = 0.3;
// Presence (fraction of cells drawn): dense at the edge → sparse outward.
export const PIXEL_INNER_PRESENCE = 1;
export const PIXEL_OUTER_PRESENCE = 0.6;
// Fraction that fluctuates: almost none at the edge → more toward the outside.
export const PIXEL_FLUCTUATE_INNER = 0.04;
export const PIXEL_FLUCTUATE_OUTER = 0.6;
// How far a fluctuating pixel dips below its local opacity (0 = no shimmer, 1 =
// down to fully transparent). Kept < 1 so shimmer never breaks the gradient.
export const PIXEL_FLUCTUATE_DEPTH = 0.5;
