import {
  NOTEBOOK_ASPECT,
  NOTEBOOK_PARK_CENTER_VH,
  PIPELINE_STEPS,
  SMALL_NOTEBOOK_WIDTH_PX,
} from './manifesto.constants';

export type Side = 'L' | 'R';

export interface VisionNode {
  id: string;
  icon: string;
  x: number;
  y: number;
  side: Side;
  /** Normalised position along the serpentine path (0..1). */
  drawU: number;
}

export interface VisionBox {
  index: number;
  x: number;
  y: number;
  side: Side;
  drawU: number;
}

export interface Pt {
  x: number;
  y: number;
}

export interface VisionLayout {
  pathD: string;
  nodes: VisionNode[];
  boxes: VisionBox[];
  notebookEnd: Pt;
  /** Path anchors in draw order (start → nodes → notebookEnd). */
  anchors: Pt[];
  /** Dimensions of the (possibly taller-than-viewport) world the path lives in. */
  worldW: number;
  worldH: number;
}

/** Arc-length sample table for a layout's serpentine path. */
export interface ArcSamples {
  pts: Pt[];
  /** Cumulative arc length at each sample (cum[0] = 0). */
  cum: number[];
  total: number;
}

// Node vertical positions (fraction of the band) and bend side. Each node's
// `drawU` (where the line reaches it) is computed from the path's true arc length
// below, so the bubble pops the instant the drawing tip arrives at it.
const NODE_Y_FRAC = [0.08, 0.285, 0.49, 0.695, 0.9];
const NODE_SIDE: Side[] = ['R', 'L', 'R', 'L', 'R'];

// Finder boxes sit in the open bays — opposite the bend, in the vertical gaps.
// `x` is a fixed fraction of the width off-centre (NOT amp-based) so the boxes
// stay inside the curve swing rather than getting pushed off-screen. Pulled in
// from 0.17 so the boxes hug the line a little more closely.
const BOX_X_FRAC = 0.12;
const BOX_DEFS: { side: Side; yFrac: number; drawU: number }[] = [
  { side: 'R', yFrac: 0.285, drawU: 0.22 },
  { side: 'L', yFrac: 0.49, drawU: 0.48 },
  { side: 'R', yFrac: 0.695, drawU: 0.7 },
];

/**
 * Deterministic geometry for the serpentine vision area, shared by
 * ManifestoPipeline (path + nodes) and ManifestoVision (finder-box anchors).
 * All coordinates are world pixels.
 *
 * `worldH` is the vertical extent the path is drawn across. In the camera-follow
 * (motion) path it is several viewport-heights tall, so the serpentine becomes a
 * long journey the camera pans down; the notebook sits at its very bottom and is
 * off-screen until the drawing tip reaches it. When omitted it defaults to a
 * single viewport height `h` (the reduced-motion / static fallback, where the
 * whole pipeline composes on one screen and the notebook parks at
 * NOTEBOOK_PARK_CENTER_VH).
 */
export function computeVisionLayout(w: number, h: number, worldH?: number): VisionLayout {
  const cx = w / 2;
  const amp = Math.min(w * 0.28, 440);

  const smallNotebookWidth = Math.min(SMALL_NOTEBOOK_WIDTH_PX, w * 0.72);
  const smallNotebookHeight = smallNotebookWidth / NOTEBOOK_ASPECT;

  // Band starts at the very top of the world (no gap above the line). When no
  // explicit world height is given, fall back to the single-screen layout where
  // the notebook parks at NOTEBOOK_PARK_CENTER_VH of the viewport.
  const yTop = 0;
  const bandH = worldH ?? h;
  const yBottom =
    worldH == null
      ? NOTEBOOK_PARK_CENTER_VH * h - smallNotebookHeight / 2
      : bandH - smallNotebookHeight / 2;
  const span = Math.max(1, yBottom - yTop);

  const sideX = (side: Side) => cx + (side === 'R' ? amp : -amp);

  const nodes: VisionNode[] = PIPELINE_STEPS.map((step, i) => ({
    id: step.id,
    icon: step.icon,
    x: sideX(NODE_SIDE[i]),
    y: yTop + NODE_Y_FRAC[i] * span,
    side: NODE_SIDE[i],
    drawU: 0, // filled from true arc length below
  }));

  const boxes: VisionBox[] = BOX_DEFS.map((b, i) => ({
    index: i,
    x: cx + (b.side === 'R' ? w * BOX_X_FRAC : -w * BOX_X_FRAC),
    y: yTop + b.yFrac * span,
    side: b.side,
    drawU: b.drawU,
  }));

  const notebookEnd = { x: cx, y: yBottom };

  // Each node sits at a path anchor (anchor index i+1). Its true arc-length
  // fraction — where the dashed reveal's tip actually reaches it — drives drawU,
  // so the bubble pops the moment the line gets there (not a beat after).
  const anchorFrac = anchorArcFractions([
    { x: sideX('R'), y: 0 },
    ...nodes.map((n) => ({ x: n.x, y: n.y })),
    notebookEnd,
  ]);
  nodes.forEach((n, i) => {
    n.drawU = anchorFrac[i + 1];
  });

  // One smooth serpentine: starts at the very top directly above Push (right
  // side), drops into Push, then weaves through every node to the notebook top.
  // Vertical-tangent cubics give the weaving S without kinks at the nodes.
  const anchors: Pt[] = [{ x: sideX('R'), y: 0 }, ...nodes.map((n) => ({ x: n.x, y: n.y })), notebookEnd];
  let pathD = `M ${anchors[0].x.toFixed(1)} ${anchors[0].y.toFixed(1)}`;
  for (let i = 1; i < anchors.length; i++) {
    const a = anchors[i - 1];
    const b = anchors[i];
    const dy = (b.y - a.y) * 0.5;
    pathD += ` C ${a.x.toFixed(1)} ${(a.y + dy).toFixed(1)}, ${b.x.toFixed(1)} ${(b.y - dy).toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }

  return { pathD, nodes, boxes, notebookEnd, anchors, worldW: w, worldH: bandH };
}

// Steps per cubic segment when sampling the path for arc length. The serpentine
// has ~6 gentle segments, so 24 steps each is smooth enough for the camera tip.
const SAMPLES_PER_SEGMENT = 24;

/**
 * Cumulative arc-length fraction (0..1) at each path anchor. Nodes live at anchor
 * boundaries, so `frac[i+1]` is exactly where the dashed reveal's tip reaches node
 * `i`. Uses the same vertical-tangent cubics as `pathD` / `buildArcSamples`.
 */
function anchorArcFractions(anchors: Pt[]): number[] {
  const segLens: number[] = [];
  let total = 0;

  for (let i = 1; i < anchors.length; i++) {
    const a = anchors[i - 1];
    const b = anchors[i];
    const dy = (b.y - a.y) * 0.5;
    const c1 = { x: a.x, y: a.y + dy };
    const c2 = { x: b.x, y: b.y - dy };

    let len = 0;
    let px = a.x;
    let py = a.y;
    for (let s = 1; s <= SAMPLES_PER_SEGMENT; s++) {
      const t = s / SAMPLES_PER_SEGMENT;
      const mt = 1 - t;
      const x =
        mt * mt * mt * a.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * b.x;
      const y =
        mt * mt * mt * a.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * b.y;
      len += Math.hypot(x - px, y - py);
      px = x;
      py = y;
    }
    segLens.push(len);
    total += len;
  }

  const frac = [0];
  let acc = 0;
  for (const len of segLens) {
    acc += len;
    frac.push(total > 0 ? acc / total : 0);
  }
  return frac;
}

/**
 * Sample the serpentine path (same vertical-tangent cubics as `pathD`) into an
 * arc-length table so the camera can find the drawing tip's world position at a
 * given arc-length fraction — matching the SVG's `pathLength=1` dash reveal.
 */
export function buildArcSamples(layout: VisionLayout): ArcSamples {
  const { anchors } = layout;
  const pts: Pt[] = [];
  const cum: number[] = [];

  let total = 0;
  let prev: Pt | null = null;

  for (let i = 1; i < anchors.length; i++) {
    const a = anchors[i - 1];
    const b = anchors[i];
    const dy = (b.y - a.y) * 0.5;
    // Cubic control points mirror computeVisionLayout's `C` command.
    const c1 = { x: a.x, y: a.y + dy };
    const c2 = { x: b.x, y: b.y - dy };

    // Include the segment start only for the very first segment; subsequent
    // segments reuse the previous segment's end point to avoid duplicates.
    const startStep = i === 1 ? 0 : 1;
    for (let s = startStep; s <= SAMPLES_PER_SEGMENT; s++) {
      const t = s / SAMPLES_PER_SEGMENT;
      const mt = 1 - t;
      const x =
        mt * mt * mt * a.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * b.x;
      const y =
        mt * mt * mt * a.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * b.y;
      const pt = { x, y };
      if (prev) {
        total += Math.hypot(x - prev.x, y - prev.y);
      }
      pts.push(pt);
      cum.push(total);
      prev = pt;
    }
  }

  return { pts, cum, total };
}

/**
 * World position of the drawing tip at arc-length fraction `f` (0..1). `f = 1`
 * returns the path's final anchor (the notebook terminus) exactly.
 */
export function pointAtFraction(samples: ArcSamples, f: number): Pt {
  const { pts, cum, total } = samples;
  if (pts.length === 0) return { x: 0, y: 0 };
  if (f <= 0) return pts[0];
  if (f >= 1) return pts[pts.length - 1];

  const target = f * total;
  // Linear scan (≤ ~150 samples) for the bracketing pair.
  let i = 1;
  while (i < cum.length && cum[i] < target) i++;
  const segLen = cum[i] - cum[i - 1];
  const u = segLen > 0 ? (target - cum[i - 1]) / segLen : 0;
  const a = pts[i - 1];
  const b = pts[i];
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
}
