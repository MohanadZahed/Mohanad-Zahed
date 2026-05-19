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

// Distribute bubble centre angles around the ring so each bubble gets an
// angular slot proportional to how much it actually projects onto the ring's
// tangent at its angle. A wide label near the top/bottom of the ring (where
// the tangent is horizontal) projects its full width onto the tangent and
// therefore claims a larger slot; the same label near the left/right (tangent
// vertical) only needs the bubble's height. This stops top/bottom bubbles from
// crowding while the sides keep their natural spacing.
function computeRingAngles(items: readonly KnowledgeItem[]): number[] {
  const n = items.length;
  if (n === 0) return [];
  // Seed with uniform angles so we can evaluate the tangent projection at a
  // reasonable starting point. One pass is enough — the weights converge.
  const seedAngle = (i: number) => (i / n) * Math.PI * 2 - Math.PI / 2;
  const widthOf = (label: string) => label.length * BUBBLE_PX_PER_CHAR + BUBBLE_PADDING_PX;
  const weights = items.map((it, i) => {
    const a = seedAngle(i);
    // Tangential extent of an axis-aligned rectangle at angle `a`.
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

  const { minPx, maxPx, centerOffsetY, bubbleScale } = getRingGeometry(viewport.w, viewport.h);
  const total = KNOWLEDGE.length;
  const baseAngles = useMemo(() => computeRingAngles(KNOWLEDGE), []);

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
        {KNOWLEDGE.map((item, i) => {
          // Width-aware angular slots (see computeRingAngles), tiny jitter for
          // organic feel, and a small radius band so the ring stays a ring.
          const jitter = (hash01(i) - 0.5) * 2 * RING_ANGLE_JITTER_RAD;
          const restAngle = baseAngles[i] + jitter;
          const restRadius = lerp(minPx, maxPx, hash01(i + 91));
          return (
            <KnowledgeBubble
              key={item.id}
              item={item}
              index={i}
              total={total}
              restAngle={restAngle}
              restRadius={restRadius}
              knowledgeProgress={progress}
              bubbleScale={bubbleScale}
            />
          );
        })}
      </div>
    </div>
  );
}
