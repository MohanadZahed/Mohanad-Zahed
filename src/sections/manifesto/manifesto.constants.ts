export const SECTION_VH = 690;

export const SMALL_NOTEBOOK_WIDTH_PX = 480;
export const FULL_NOTEBOOK_MAX_WIDTH_PX = 2000;

export const NOTEBOOK_ASPECT = 16 / 10;

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
} as const;

// Terminal session inside the laptop screen. Each command types in sequentially
// after scale-up and PERSISTS once typed (no hold/fade — they stack like a real
// shell session). Prompt line i appears at its typeStart (the prior command's
// "enter"). The final `show skills` finishes at 0.72, leaving 0.72 → ~0.80 (where
// Skills' overlap pin engages) to hold the fully-composed terminal before Skills
// emerges from the screen. The prompt + verbs are CLI/code tokens, kept verbatim
// across locales (same rule as filenames).
export const TERMINAL_COMMANDS = [
  { command: 'run plan', typeStart: 0.47, typeEnd: 0.51 },
  { command: 'run build', typeStart: 0.535, typeEnd: 0.575 },
  { command: 'run improve', typeStart: 0.6, typeEnd: 0.645 },
  { command: 'show skills', typeStart: 0.67, typeEnd: 0.72 },
] as const;

export const TERMINAL_PROMPT_USER = 'mohanad@zahed';
export const TERMINAL_PROMPT_PATH = '~';

// Circuit-tree backdrop draws on over this section-local window:
// starts when the title finishes typing (= TITLE_TYPE_END in ManifestoStage),
// finishes exactly when the notebook image begins scaling up.
export const CIRCUIT_PAINT_START = 0.045;
export const CIRCUIT_PAINT_END = PHASE.SCALE_START; // 0.37

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
  heightPct: 71,
} as const;

// Rectangle (in % of the notebook image) that the Skills section fills as it
// emerges from / scales out of the laptop screen. Independent of the video so
// you can tune it freely. All four are percentages of the notebook image:
//   leftPct / topPct  → top-left corner of the rect
//   widthPct / heightPct → its size
// Lower topPct or larger heightPct = taller (reaches further down the screen).
export const SKILLS_SCREEN_RECT = {
  leftPct: 16.38,
  topPct: 7,
  widthPct: 67.7,
  heightPct: 70,
} as const;

/**
 * The notebook's final (fully scaled-up) box in viewport pixels. Past
 * PHASE.SCALE_END the wrapper is viewport-centered with this size, so the box
 * is deterministic and can be reproduced anywhere that needs the on-screen
 * geometry (e.g. the Skills section emerging from the laptop screen).
 */
export function computeNotebookBoxPx(vw: number, vh: number) {
  const fullWidth = Math.min(vw, FULL_NOTEBOOK_MAX_WIDTH_PX);
  const fullHeightForWidth = fullWidth / NOTEBOOK_ASPECT;
  const widthIfHeightCapped = vh * NOTEBOOK_ASPECT;
  const finalWidth = fullHeightForWidth > vh ? Math.min(widthIfHeightCapped, fullWidth) : fullWidth;
  const finalHeight = finalWidth / NOTEBOOK_ASPECT;
  return {
    finalWidth,
    finalHeight,
    boxLeft: (vw - finalWidth) / 2,
    boxTop: (vh - finalHeight) / 2,
  };
}

/**
 * The on-screen rectangle (in viewport pixels) that the Skills section fills as
 * it emerges from the laptop screen. Driven by SKILLS_SCREEN_RECT — tune that
 * constant to resize/reposition the Skills view inside the notebook.
 */
export function computeScreenRectPx(vw: number, vh: number) {
  const { finalWidth, finalHeight, boxLeft, boxTop } = computeNotebookBoxPx(vw, vh);
  return {
    rectX: boxLeft + (SKILLS_SCREEN_RECT.leftPct / 100) * finalWidth,
    rectY: boxTop + (SKILLS_SCREEN_RECT.topPct / 100) * finalHeight,
    rectW: (SKILLS_SCREEN_RECT.widthPct / 100) * finalWidth,
    rectH: (SKILLS_SCREEN_RECT.heightPct / 100) * finalHeight,
  };
}
