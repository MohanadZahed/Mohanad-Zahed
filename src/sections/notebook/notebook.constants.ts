export const SECTION_VH = 625;

export const SMALL_NOTEBOOK_WIDTH_PX = 480;
export const FULL_NOTEBOOK_MAX_WIDTH_PX = 2000;

export const FINDER_BOX_WIDTH_PX = 360;
export const FINDER_BOX_HEIGHT_PX = 260;

// Each box owns a scroll window [start, end]; start_{i+1} = start_i + 0.63 * (end - start)
// so when box i is ~30% from the viewport top, box i+1 begins rising from below.
// Typing for a box completes at its window midpoint (vertical centre of viewport).
export const FINDER_BOX_RANGES = [
  [0.08, 0.21],
  [0.16, 0.29],
  [0.24, 0.37],
] as const;

export const PHASE = {
  ENTRY_END: 0.08,

  PIN_START: 0.08,
  PIN_END: 0.37,

  // Last box exits at 0.37 — terminal must finish covering by then.
  TERMINAL_OPEN_START: 0.33,
  TERMINAL_OPEN_END: 0.37,

  SCALE_START: 0.37,
  SCALE_END: 0.47,

  PLAN_TYPE_IN: [0.47, 0.5] as const,
  PLAN_HOLD_END: 0.54,
  PLAN_FADE_END: 0.56,

  BUILD_TYPE_IN: [0.56, 0.59] as const,
  BUILD_HOLD_END: 0.63,
  BUILD_FADE_END: 0.65,

  IMPROVE_TYPE_IN: [0.65, 0.68] as const,
  IMPROVE_HOLD_END: 0.72,
  IMPROVE_FADE_END: 0.74,

  HANDOFF_START: 0.8,
  HANDOFF_END: 0.87,
} as const;

export const SCREEN_RECT = {
  leftPct: 18,
  topPct: 8,
  widthPct: 64,
  heightPct: 48,
} as const;

export const MEDIA_SCREEN_RECT = {
  leftPct: 16,
  topPct: 7,
  widthPct: 68,
  heightPct: 70,
} as const;
