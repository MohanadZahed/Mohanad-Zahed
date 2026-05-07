export const SECTION_VH = 600;

export const SMALL_NOTEBOOK_WIDTH_PX = 480;
export const FULL_NOTEBOOK_MAX_WIDTH_PX = 2000;

export const FINDER_BOX_WIDTH_PX = 360;
export const FINDER_BOX_HEIGHT_PX = 260;
export const FINDER_OFFSET_BELOW_NOTEBOOK_PX = 500;
export const FINDER_TYPING_START = 0.04;
export const FINDER_LINE_STAGGER_MS = 1100;
export const FINDER_LINE_BASE_DELAY_MS = 200;

export const PHASE = {
  PIN_START: 0.08,
  PIN_END: 0.3,
  SCALE_START: 0.12,
  SCALE_END: 0.24,

  PLAN_TYPE_IN: [0.24, 0.28] as const,
  PLAN_HOLD_END: 0.34,
  PLAN_FADE_END: 0.37,

  BUILD_TYPE_IN: [0.37, 0.41] as const,
  BUILD_HOLD_END: 0.47,
  BUILD_FADE_END: 0.5,

  IMPROVE_TYPE_IN: [0.5, 0.54] as const,
  IMPROVE_HOLD_END: 0.6,
  IMPROVE_FADE_END: 0.64,

  HANDOFF_START: 0.4,
  HANDOFF_END: 1.0,
} as const;

export const SCREEN_RECT = {
  leftPct: 18,
  topPct: 8,
  widthPct: 64,
  heightPct: 48,
} as const;
