export const SECTION_VH = 625;

export const SMALL_NOTEBOOK_WIDTH_PX = 480;
export const FULL_NOTEBOOK_MAX_WIDTH_PX = 2000;

export const FINDER_BOX_WIDTH_PX = 360;
export const FINDER_BOX_HEIGHT_PX = 260;
export const FINDER_OFFSET_BELOW_NOTEBOOK_PX = 500;
export const FINDER_TYPING_START = 0.16;
export const FINDER_LINE_STAGGER_MS = 1100;
export const FINDER_LINE_BASE_DELAY_MS = 200;

export const PHASE = {
  ENTRY_END: 0.1,

  PIN_START: 0.1,
  PIN_END: 0.36,

  FINDER_IN_START: 0.12,
  FINDER_IN_END: 0.18,
  FINDER_HOLD_END: 0.3,
  FINDER_OUT_END: 0.36,

  SCALE_START: 0.36,
  SCALE_END: 0.46,

  PLAN_TYPE_IN: [0.46, 0.49] as const,
  PLAN_HOLD_END: 0.53,
  PLAN_FADE_END: 0.55,

  BUILD_TYPE_IN: [0.55, 0.58] as const,
  BUILD_HOLD_END: 0.62,
  BUILD_FADE_END: 0.64,

  IMPROVE_TYPE_IN: [0.64, 0.67] as const,
  IMPROVE_HOLD_END: 0.71,
  IMPROVE_FADE_END: 0.73,

  HANDOFF_START: 0.8,
  HANDOFF_END: 0.87,
} as const;

export const SCREEN_RECT = {
  leftPct: 18,
  topPct: 8,
  widthPct: 64,
  heightPct: 48,
} as const;
