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

export const RING_RADIUS_MIN_PX = 280;
export const RING_RADIUS_MAX_PX = 320;
export const RING_ANGLE_JITTER_RAD = 0.06;

// Global progress band where the YogaAvatar is on stage.
// Page composition: Hero(1) + About(1) + Notebook(6.25) + Skills(1) + Knowledge(3)
// + Experience(~16) + Contact(1) ≈ 29.25vh → scroll range ≈ 28.25vh.
// TOP   = section TOP at viewport BOTTOM (avatar starts rising from below).
// CENTER = section TOP at viewport TOP (sticky pins, avatar at viewport centre).
// PIN_END = ScrollTrigger end ('bottom bottom'), knowledgeProgress reaches 1.
// BOTTOM  = section BOTTOM at viewport TOP (section fully scrolled out).
const SCROLL_RANGE_VH = 28.25;
export const KNOWLEDGE_TOP_PROGRESS = 8.6 / SCROLL_RANGE_VH;
export const KNOWLEDGE_CENTER_PROGRESS = 9.6 / SCROLL_RANGE_VH;
export const KNOWLEDGE_PIN_END_PROGRESS = 11.65 / SCROLL_RANGE_VH;
export const KNOWLEDGE_BOTTOM_PROGRESS = 12.95 / SCROLL_RANGE_VH;
