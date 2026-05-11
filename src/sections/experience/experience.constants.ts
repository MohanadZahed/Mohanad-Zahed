export const COMPANY_HEADER_HEIGHT_PX = 72;
export const PIN_TOP_PX = 8; // stage pins this many px below the viewport top
export const CARD_MAX_W_PX = 1472;
export const STACK_BREAKPOINT_PX = 768;

// Per-card vertical scroll budget while the stage is pinned. A company with N
// projects gets a section height of (N + 1) * STAGE_SCROLL_UNIT_VH.
export const STAGE_SCROLL_UNIT_VH = 80;
export const STAGE_BOTTOM_MARGIN_PX = 16;

// Tag tabs fan out horizontally per index, then wrap to a new row when the row is full.
// The first row sits flush at the top of the region with the full height; subsequent
// rows sit progressively lower and shorter, and each tab's bottom always meets the card
// body so nothing reads as "flying".
export const TAG_ROW_HEIGHTS_PX = [48, 28, 18, 14] as const;
export const TAG_WIDTH_PX = 150;
export const TAG_GAP_PX = 5;

export interface TagLayout {
  tagsPerRow: number;
  rowsUsed: number;
}

// Pack as many fixed-width tabs as the container can hold (with `TAG_GAP_PX`
// between them), bounded so we never need more rows than `TAG_ROW_HEIGHTS_PX`
// has heights for.
export function deriveTagLayout(total: number, containerWidth: number): TagLayout {
  if (total <= 0) return { tagsPerRow: 1, rowsUsed: 1 };
  const minTagsPerRow = Math.max(1, Math.ceil(total / TAG_ROW_HEIGHTS_PX.length));
  if (containerWidth <= 0) {
    const tagsPerRow = Math.max(minTagsPerRow, Math.min(total, 4));
    return { tagsPerRow, rowsUsed: Math.max(1, Math.ceil(total / tagsPerRow)) };
  }
  const slotPx = TAG_WIDTH_PX + TAG_GAP_PX;
  const maxByWidth = Math.max(1, Math.floor((containerWidth + TAG_GAP_PX) / slotPx));
  const tagsPerRow = Math.max(minTagsPerRow, Math.min(total, maxByWidth));
  return { tagsPerRow, rowsUsed: Math.max(1, Math.ceil(total / tagsPerRow)) };
}

export interface TagPosition {
  rowIndex: number;
  colIndex: number;
  topPx: number;
  leftPx: number;
  widthPx: number;
}

export function tagPositionForIndex(
  index: number,
  layout: TagLayout,
): TagPosition {
  const { tagsPerRow, rowsUsed } = layout;
  const rowIndex = Math.floor(index / tagsPerRow);
  const colIndex = index % tagsPerRow;
  const topPx = TAG_ROW_HEIGHTS_PX
    .slice(0, Math.min(rowIndex, rowsUsed))
    .reduce<number>((sum, h) => sum + h, 0);
  const leftPx = colIndex * (TAG_WIDTH_PX + TAG_GAP_PX);
  return { rowIndex, colIndex, topPx, leftPx, widthPx: TAG_WIDTH_PX };
}

export function tagRegionHeight(rowsUsed: number): number {
  return TAG_ROW_HEIGHTS_PX
    .slice(0, Math.max(1, rowsUsed))
    .reduce<number>((sum, h) => sum + h, 0);
}
