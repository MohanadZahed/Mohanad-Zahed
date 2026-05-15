import { useEffect, useState } from 'react';
import { Typewriter } from '../../components/Typewriter';
import { clamp, lerp } from '../../scene/lib/math';
import { KnowledgeBubble } from './KnowledgeBubble';
import { KNOWLEDGE } from './knowledge.data';
import {
  PHASE,
  RING_ANGLE_JITTER_RAD,
  RING_RADIUS_MAX_PX,
  RING_RADIUS_MIN_PX,
} from './knowledge.constants';
import { useT } from '../../i18n/useT';

interface KnowledgeStageProps {
  progress: number;
}

const MOBILE_BREAKPOINT_PX = 768;

// Deterministic 0..1 hash from a non-negative integer.
function hash01(i: number): number {
  let x = (i + 1) * 2654435761;
  x = (x ^ (x >>> 15)) >>> 0;
  return (x % 10000) / 10000;
}

export function KnowledgeStage({ progress }: KnowledgeStageProps) {
  const { t } = useT();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const titleProgress = clamp(
    (progress - PHASE.TITLE_TYPE_START) / (PHASE.TITLE_TYPE_END - PHASE.TITLE_TYPE_START),
    0,
    1,
  );

  const total = KNOWLEDGE.length;

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
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 600,
          color: 'var(--knowledge-ink, rgba(244, 244, 245, 0.95))',
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

      {isMobile ? (
        <div
          style={{
            position: 'absolute',
            top: '24vh',
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexWrap: 'wrap',
            alignContent: 'flex-start',
            justifyContent: 'center',
            gap: 12,
            padding: '0 16px',
          }}
        >
          {KNOWLEDGE.map((item, i) => (
            <KnowledgeBubble
              key={item.id}
              item={item}
              index={i}
              total={total}
              restAngle={0}
              restRadius={0}
              knowledgeProgress={progress}
              layout='grid'
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
          }}
        >
          {KNOWLEDGE.map((item, i) => {
            // Even angular distribution around the avatar with small jitter,
            // and a tight radius band so the bubbles read as a single ring.
            const baseAngle = (i / total) * Math.PI * 2 - Math.PI / 2;
            const jitter = (hash01(i) - 0.5) * 2 * RING_ANGLE_JITTER_RAD;
            const restAngle = baseAngle + jitter;
            const restRadius = lerp(RING_RADIUS_MIN_PX, RING_RADIUS_MAX_PX, hash01(i + 91));
            return (
              <KnowledgeBubble
                key={item.id}
                item={item}
                index={i}
                total={total}
                restAngle={restAngle}
                restRadius={restRadius}
                knowledgeProgress={progress}
                layout='ring'
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
