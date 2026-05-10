export const SECTION_VH = 1200;

export const PIN_TOP_PX = 88;
export const CARD_MAX_W_PX = 1472;
export const STACK_BREAKPOINT_PX = 768;

export function tagOffsetForProjectCount(count: number): number {
  if (count <= 1) return 0;
  if (count === 2) return 320;
  if (count <= 4) return 220;
  if (count <= 6) return 180;
  return 150;
}
