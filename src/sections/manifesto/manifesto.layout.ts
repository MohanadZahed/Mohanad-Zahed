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

export interface VisionLayout {
  pathD: string;
  nodes: VisionNode[];
  boxes: VisionBox[];
  notebookEnd: { x: number; y: number };
}

// Node vertical positions (fraction of the band), bend side, and draw fraction
// (normalised position along the path where the node sits). The first segment
// (top → Push) is a short vertical drop on the right, so Push's drawU is small.
const NODE_Y_FRAC = [0.08, 0.285, 0.49, 0.695, 0.9];
const NODE_SIDE: Side[] = ['R', 'L', 'R', 'L', 'R'];
const NODE_DRAW_U = [0.12, 0.305, 0.51, 0.715, 0.92];

// Finder boxes sit in the open bays — opposite the bend, in the vertical gaps.
// `x` is a fixed fraction of the width off-centre (NOT amp-based) so the boxes
// stay inside the curve swing rather than getting pushed off-screen.
const BOX_X_FRAC = 0.17;
const BOX_DEFS: { side: Side; yFrac: number; drawU: number }[] = [
  { side: 'R', yFrac: 0.285, drawU: 0.22 },
  { side: 'L', yFrac: 0.49, drawU: 0.48 },
  { side: 'R', yFrac: 0.695, drawU: 0.7 },
];

/**
 * Deterministic geometry for the serpentine vision area, shared by
 * ManifestoPipeline (path + nodes) and ManifestoVision (finder-box anchors).
 * All coordinates are viewport pixels.
 */
export function computeVisionLayout(w: number, h: number): VisionLayout {
  const cx = w / 2;
  const amp = Math.min(w * 0.28, 440);

  const smallNotebookWidth = Math.min(SMALL_NOTEBOOK_WIDTH_PX, w * 0.72);
  const smallNotebookHeight = smallNotebookWidth / NOTEBOOK_ASPECT;

  // Band starts at the very top of the screen (no gap above the line).
  const yTop = 0;
  const yBottom = NOTEBOOK_PARK_CENTER_VH * h - smallNotebookHeight / 2;
  const span = Math.max(1, yBottom - yTop);

  const sideX = (side: Side) => cx + (side === 'R' ? amp : -amp);

  const nodes: VisionNode[] = PIPELINE_STEPS.map((step, i) => ({
    id: step.id,
    icon: step.icon,
    x: sideX(NODE_SIDE[i]),
    y: yTop + NODE_Y_FRAC[i] * span,
    side: NODE_SIDE[i],
    drawU: NODE_DRAW_U[i],
  }));

  const boxes: VisionBox[] = BOX_DEFS.map((b, i) => ({
    index: i,
    x: cx + (b.side === 'R' ? w * BOX_X_FRAC : -w * BOX_X_FRAC),
    y: yTop + b.yFrac * span,
    side: b.side,
    drawU: b.drawU,
  }));

  const notebookEnd = { x: cx, y: yBottom };

  // One smooth serpentine: starts at the very top directly above Push (right
  // side), drops into Push, then weaves through every node to the notebook top.
  // Vertical-tangent cubics give the weaving S without kinks at the nodes.
  const anchors = [{ x: sideX('R'), y: 0 }, ...nodes, notebookEnd];
  let pathD = `M ${anchors[0].x.toFixed(1)} ${anchors[0].y.toFixed(1)}`;
  for (let i = 1; i < anchors.length; i++) {
    const a = anchors[i - 1];
    const b = anchors[i];
    const dy = (b.y - a.y) * 0.5;
    pathD += ` C ${a.x.toFixed(1)} ${(a.y + dy).toFixed(1)}, ${b.x.toFixed(1)} ${(b.y - dy).toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }

  return { pathD, nodes, boxes, notebookEnd };
}
