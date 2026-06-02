import { useMemo, type CSSProperties } from 'react';
import { clamp, smoothstep } from '../../scene/lib/math';
import { CIRCUIT_PAINT_END, CIRCUIT_PAINT_START } from './manifesto.constants';

/**
 * Glowing circuit-tree backdrop for the Manifesto section. Four top nodes send
 * leads down that branch (orthogonal runs + 45° elbows) into a fan of terminal
 * ring-nodes — modelled on the reference art.
 *
 * Rendered as inline <svg> (not <img>/CSS-mask) so `stroke="currentColor"` lets
 * the colour be changed via the `color` prop and the glow tracks it. Default
 * white. Each trace draws on per-path, but the reveal is driven by a virtual
 * horizontal sweep line falling top→bottom, so the whole tree paints downward.
 *
 * Reveal is a pure function of the manifesto section-local `progress`, computed
 * in render (the stage already re-renders every scroll tick) — no store field,
 * no useFrame, no refs.
 */

const VIEWBOX_W = 1024;
const VIEWBOX_H = 1536;

type Segment = { d: string; yTop: number; yBottom: number };
type Node = { cx: number; cy: number; r: number; filled: boolean };

// Deterministic [-1, 1] jitter so the tree feels hand-routed but stays stable.
function jit(seed: number): number {
  const r = Math.sin(seed * 127.1) * 43758.5453;
  return (r - Math.floor(r)) * 2 - 1;
}

// Connector from parent → child: one 45° elbow joining two orthogonal runs.
// variant 0 = vertical first then diagonal; variant 1 = diagonal first then
// vertical. Authored top-end-first so the stroke draws downward.
function connector(
  px: number,
  py: number,
  cx: number,
  cy: number,
  variant: number,
): Segment {
  const dx = Math.abs(cx - px);
  const pts: [number, number][] =
    variant === 0
      ? [
          [px, py],
          [px, cy - dx],
          [cx, cy],
        ]
      : [
          [px, py],
          [cx, py + dx],
          [cx, cy],
        ];
  const ys = pts.map((p) => p[1]);
  return {
    d: `M ${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ')}`,
    yTop: Math.min(...ys),
    yBottom: Math.max(...ys),
  };
}

function buildCircuit(): { segments: Segment[]; nodes: Node[] } {
  const segments: Segment[] = [];
  const nodes: Node[] = [];

  const LEAD_Y = 220;
  const A_Y = 470;
  const B_Y = 808;

  const roots = [404, 476, 548, 620];
  const bias = [-1, -0.42, 0.42, 1];

  const S_A = 130;
  const s_A = 72;
  const S_B = 72;
  const s_B = 46;

  let seed = 1;
  let variant = 0;
  const flip = () => (variant = variant === 0 ? 1 : 0);

  roots.forEach((rx, ri) => {
    const b = bias[ri];

    // vertical lead from the very top down to its junction
    segments.push({ d: `M ${rx} 0 L ${rx} ${LEAD_Y}`, yTop: 0, yBottom: LEAD_Y });
    nodes.push({ cx: rx, cy: LEAD_Y, r: 3, filled: true });

    // level A: two children fanning toward this root's side
    const aXs = [rx + b * S_A - s_A, rx + b * S_A + s_A];
    aXs.forEach((ax) => {
      segments.push(connector(rx, LEAD_Y, ax, A_Y, variant));
      flip();
      nodes.push({ cx: ax, cy: A_Y, r: 5, filled: true });

      // short outward stub ending in a ring (mid-height leaves)
      const stubX = ax + b * 70 + jit(seed++) * 22;
      const stubY = A_Y + 150 + jit(seed++) * 30;
      segments.push(connector(ax, A_Y, stubX, stubY, variant));
      flip();
      nodes.push({ cx: stubX, cy: stubY, r: 5, filled: true });

      // level B: two children
      const bXs = [ax + b * S_B - s_B, ax + b * S_B + s_B];
      bXs.forEach((bx, bi) => {
        segments.push(connector(ax, A_Y, bx, B_Y, variant));
        flip();
        nodes.push({ cx: bx, cy: B_Y, r: 5, filled: true });

        // long descending tail → terminal ring near the bottom
        const termX = clamp(bx + b * 30 + jit(seed++) * 44, 70, VIEWBOX_W - 70);
        const termY = 1110 + ((ri * 2 + bi) % 4) * 92 + jit(seed++) * 40;
        segments.push(connector(bx, B_Y, termX, termY, variant));
        flip();
        nodes.push({ cx: termX, cy: termY, r: 5, filled: true });
      });
    });
  });

  return { segments, nodes };
}

interface ManifestoCircuitProps {
  progress: number;
  color?: string;
}

const STROKE_WIDTH = 3.4;

export function ManifestoCircuit({ progress, color = '#ffffff' }: ManifestoCircuitProps) {
  const { segments, nodes } = useMemo(() => buildCircuit(), []);

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Glow only on fine-pointer (desktop) devices. A CSS filter rasterizes the
  // whole animated SVG into one cached layer; WebKit (iOS) fails to invalidate
  // it when descendant attrs change per tick, leaving ghost node-dots. Omitting
  // the filter on coarse-pointer devices avoids that repaint bug entirely.
  const finePointer = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches,
    [],
  );

  const paint = clamp((progress - CIRCUIT_PAINT_START) / (CIRCUIT_PAINT_END - CIRCUIT_PAINT_START), 0, 1);
  const sweepY = reduced ? VIEWBOX_H : paint * VIEWBOX_H;

  const wrapperStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 0,
    color,
  };

  return (
    <div style={wrapperStyle} aria-hidden='true'>
      <svg
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        preserveAspectRatio='xMidYMid meet'
        fill='none'
        stroke='currentColor'
        strokeWidth={STROKE_WIDTH}
        strokeLinecap='round'
        strokeLinejoin='round'
        style={{
          height: '100%',
          width: 'auto',
          maxWidth: '100%',
          ...(finePointer ? { filter: 'drop-shadow(0 0 2px currentColor)' } : null),
        }}
      >
        {segments.map((s, i) => {
          const drawn = reduced
            ? 1
            : clamp((sweepY - s.yTop) / Math.max(1, s.yBottom - s.yTop), 0, 1);
          // Don't render un-revealed traces — nothing paintable, nothing to ghost.
          if (drawn <= 0) return null;
          return (
            <path
              key={i}
              d={s.d}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - drawn}
            />
          );
        })}
        {nodes.map((n, i) => {
          const op = reduced ? 1 : smoothstep(n.cy - 12, n.cy + 8, sweepY);
          // Don't render un-revealed nodes — nothing paintable, nothing to ghost.
          if (op <= 0.01) return null;
          return (
            <circle
              key={i}
              cx={n.cx}
              cy={n.cy}
              r={n.r}
              fill={n.filled ? 'currentColor' : 'none'}
              style={{ opacity: op }}
            />
          );
        })}
      </svg>
    </div>
  );
}
