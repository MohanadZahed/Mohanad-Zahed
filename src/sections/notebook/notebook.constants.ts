export const SECTION_VH = 600;

export const SMALL_NOTEBOOK_WIDTH_PX = 480;
export const FULL_NOTEBOOK_MAX_WIDTH_PX = 2000;

export const FINDER_BOX_WIDTH_PX = 360;
export const FINDER_BOX_HEIGHT_PX = 260;
export const FINDER_OFFSET_BELOW_NOTEBOOK_PX = 500;

export const PHASE = {
  PIN_START: 0.08,
  PIN_END: 0.3,
  SCALE_START: 0.3,
  SCALE_END: 0.42,

  PLAN_TYPE_IN: [0.42, 0.46] as const,
  PLAN_HOLD_END: 0.52,
  PLAN_FADE_END: 0.55,

  BUILD_TYPE_IN: [0.55, 0.59] as const,
  BUILD_HOLD_END: 0.65,
  BUILD_FADE_END: 0.68,

  IMPROVE_TYPE_IN: [0.68, 0.72] as const,
  IMPROVE_HOLD_END: 0.78,
  IMPROVE_FADE_END: 0.82,

  HANDOFF_START: 0.82,
  HANDOFF_END: 1.0,
} as const;

export const SCREEN_RECT = {
  leftPct: 18,
  topPct: 8,
  widthPct: 64,
  heightPct: 48,
} as const;
