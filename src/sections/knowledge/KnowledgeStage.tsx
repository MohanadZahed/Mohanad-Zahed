import { useEffect, useMemo, useState } from 'react';
import { Typewriter } from '../../components/Typewriter';
import { clamp, lerp } from '../../scene/lib/math';
import { KnowledgeBubble } from './KnowledgeBubble';
import { KNOWLEDGE } from './knowledge.data';
import type { KnowledgeItem } from './knowledge.data';
import { PHASE, RING_ANGLE_JITTER_RAD, getRingGeometry } from './knowledge.constants';
import { useT } from '../../i18n/useT';

interface KnowledgeStageProps {
  progress: number;
}

// Deterministic 0..1 hash from a non-negative integer.
function hash01(i: number): number {
  let x = (i + 1) * 2654435761;
  x = (x ^ (x >>> 15)) >>> 0;
  return (x % 10000) / 10000;
}

const BUBBLE_HEIGHT_PX = 36;
const BUBBLE_PX_PER_CHAR = 7;
const BUBBLE_PADDING_PX = 32;
const widthOf = (label: string) => label.length * BUBBLE_PX_PER_CHAR + BUBBLE_PADDING_PX;

// Distribute bubble centre angles around an ellipse so each bubble gets an
// angular slot proportional to how much it projects onto the tangent at its
// angle. Wide labels near the top/bottom (tangent horizontal) get bigger
// slots; the same labels on the sides (tangent vertical) get narrow slots.
function computeRingAngles(items: readonly KnowledgeItem[]): number[] {
  const n = items.length;
  if (n === 0) return [];
  const seedAngle = (i: number) => (i / n) * Math.PI * 2 - Math.PI / 2;
  const weights = items.map((it, i) => {
    const a = seedAngle(i);
    return (
      Math.abs(widthOf(it.label) * Math.sin(a)) +
      Math.abs(BUBBLE_HEIGHT_PX * Math.cos(a)) +
      BUBBLE_PADDING_PX
    );
  });
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let cum = 0;
  return items.map((_, i) => {
    const slot = (weights[i] / totalWeight) * Math.PI * 2;
    const center = -Math.PI / 2 + cum + slot / 2;
    cum += slot;
    return center;
  });
}

interface Pos {
  x: number;
  y: number;
}

// Distribute bubbles by arc length along a rectangle perimeter of half-width
// rx and half-height ry. Each bubble's slot is proportional to its tangential
// footprint at its position — on the horizontal edges (top/bottom) that's the
// label width; on the vertical edges (left/right) it's the bubble height.
// Starts at the top-middle going clockwise.
function computeSquarePositions(items: readonly KnowledgeItem[], rx: number, ry: number): Pos[] {
  const n = items.length;
  if (n === 0) return [];
  const perimeter = 4 * rx + 4 * ry;

  // Map a distance d along the perimeter (mod perimeter) to (x, y).
  // Perimeter walk starts at top middle (0, -ry) going clockwise:
  //   1. top-middle → top-right corner: length rx
  //   2. top-right → bottom-right:      length 2·ry
  //   3. bottom-right → bottom-left:    length 2·rx
  //   4. bottom-left → top-left:        length 2·ry
  //   5. top-left → top-middle:         length rx
  const posAt = (d: number): Pos => {
    let p = ((d % perimeter) + perimeter) % perimeter;
    if (p < rx) return { x: p, y: -ry };
    p -= rx;
    if (p < 2 * ry) return { x: rx, y: -ry + p };
    p -= 2 * ry;
    if (p < 2 * rx) return { x: rx - p, y: ry };
    p -= 2 * rx;
    if (p < 2 * ry) return { x: -rx, y: ry - p };
    p -= 2 * ry;
    return { x: -rx + p, y: -ry };
  };

  // Tangent direction at distance d — used to pick the right footprint
  // component for the weight.
  const isHorizontalEdge = (d: number): boolean => {
    let p = ((d % perimeter) + perimeter) % perimeter;
    if (p < rx) return true; // top → right
    p -= rx;
    if (p < 2 * ry) return false; // right edge
    p -= 2 * ry;
    if (p < 2 * rx) return true; // bottom edge
    p -= 2 * rx;
    if (p < 2 * ry) return false; // left edge
    return true; // top → left
  };

  // Seed with uniform-perimeter positions to pick a footprint per bubble.
  const weights = items.map((it, i) => {
    const seedD = (i / n) * perimeter;
    return isHorizontalEdge(seedD)
      ? widthOf(it.label) + BUBBLE_PADDING_PX
      : BUBBLE_HEIGHT_PX + BUBBLE_PADDING_PX;
  });
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  let cum = 0;
  return items.map((_, i) => {
    const slot = (weights[i] / totalWeight) * perimeter;
    const center = cum + slot / 2;
    cum += slot;
    return posAt(center);
  });
}

export function KnowledgeStage({ progress }: KnowledgeStageProps) {
  const { t } = useT();
  const [viewport, setViewport] = useState(() => ({
    w: typeof window === 'undefined' ? 1280 : window.innerWidth,
    h: typeof window === 'undefined' ? 800 : window.innerHeight,
  }));

  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const titleProgress = clamp(
    (progress - PHASE.TITLE_TYPE_START) / (PHASE.TITLE_TYPE_END - PHASE.TITLE_TYPE_START),
    0,
    1,
  );

  const { minPx, maxPx, centerOffsetY, bubbleScale, aspectX, layoutMode } = getRingGeometry(
    viewport.w,
    viewport.h,
  );
  const total = KNOWLEDGE.length;
  const baseAngles = useMemo(() => computeRingAngles(KNOWLEDGE), []);

  // Pre-resolve per-bubble (restX, restY). Two layout modes:
  //   - 'ellipse': angle around an oval, with width-aware angular slots
  //   - 'square':  arc-length walk around a rectangle perimeter
  // Per-bubble hand-tuning offsets are folded in here:
  //   - desktop ellipse uses `item.x` / `item.y`
  //   - mobile square uses `item.mobileOffsets.x` / `item.mobileOffsets.y`
  const positions: Pos[] = useMemo(() => {
    const offsetFor = (item: KnowledgeItem): Pos =>
      layoutMode === 'square'
        ? { x: item.mobileOffsets?.x ?? 0, y: item.mobileOffsets?.y ?? 0 }
        : { x: item.x ?? 0, y: item.y ?? 0 };

    if (layoutMode === 'square') {
      const rectR = (minPx + maxPx) / 2;
      const rx = rectR * aspectX;
      const ry = rectR;
      const base = computeSquarePositions(KNOWLEDGE, rx, ry);
      return KNOWLEDGE.map((item, i) => {
        const off = offsetFor(item);
        return { x: base[i].x + off.x, y: base[i].y + off.y };
      });
    }
    return KNOWLEDGE.map((item, i) => {
      const jitter = (hash01(i) - 0.5) * 2 * RING_ANGLE_JITTER_RAD;
      const restAngle = baseAngles[i] + jitter;
      const restRadius = lerp(minPx, maxPx, hash01(i + 91));
      const off = offsetFor(item);
      return {
        x: Math.cos(restAngle) * restRadius * aspectX + off.x,
        y: Math.sin(restAngle) * restRadius + off.y,
      };
    });
  }, [layoutMode, minPx, maxPx, aspectX, baseAngles]);

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <h2
        id='knowledge-h2'
        style={{
          position: 'absolute',
          top: '12vh',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 'clamp(1.75rem, 6vw, 3.5rem)',
          fontWeight: 600,
          color: 'var(--knowledge-ink, rgba(0, 65, 109, 1))',
          letterSpacing: '-0.02em',
          margin: 0,
          textAlign: 'center',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        <Typewriter
          text={t('knowledge.heading')}
          scrollProgress={titleProgress}
          cursorMode='beat-then-hide'
        />
      </h2>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translateY(${centerOffsetY}px)`,
          pointerEvents: 'none',
        }}
      >
        {KNOWLEDGE.map((item, i) => (
          <KnowledgeBubble
            key={item.id}
            item={item}
            index={i}
            total={total}
            restX={positions[i].x}
            restY={positions[i].y}
            knowledgeProgress={progress}
            bubbleScale={bubbleScale}
          />
        ))}
      </div>
    </div>
  );
}
