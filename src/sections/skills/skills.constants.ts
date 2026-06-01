// Skills "emerge from the laptop screen" choreography.
//
// The Notebook section (690svh) pins its laptop full-size from its section-local
// progress 0.47 to 1.0. Skills is pulled up with a negative margin so its GSAP-
// pinned intro engages while the notebook is still pinned and full-size (just
// after the plan/build/improve words fade at notebook-progress 0.74).
//
// While pinned, the Skills content (its real, full-height self) is clipped to the
// laptop's SCREEN_RECT and scrolls UP inside it (the header rises from the bottom
// of the screen), then the screen rect + content scale up to fill the whole
// viewport. At pin release the content is at identity (top-of-section at viewport
// top) so it hands off seamlessly to a NORMAL full-height scroll — no content is
// permanently cropped; the chips below the fold scroll in normally afterward.
//
// Timing/tuning constants — adjust by feel in the dev server. svh units.

// Negative top margin (svh) that overlaps Skills onto the notebook tail. Sized so
// the pin engages ~notebook-progress 0.80: notebook bottom = top + 690svh; engage
// scroll ≈ 0.80 * (690 - 100) ≈ 472svh past the notebook top → margin ≈ 472 - 690.
export const SKILLS_OVERLAP_VH = 218;

// Pinned scroll budget (svh) for the whole emerge + zoom. The pin releases after
// this much scroll; chosen so the zoom completes ~as the notebook unpins (≈590svh).
export const INTRO_SCROLL_VH = 118;

// Sub-windows over the section-local `skillsIntro` (0..1, across INTRO_SCROLL_VH).
export const EMERGE_END = 0.3; // header slides up inside the (fixed) screen rect
export const ZOOM_START = 0.3; // screen rect + content begin scaling to viewport
export const ZOOM_END = 1.0; // fills the viewport exactly at pin release (seamless)
