import type { CSSProperties } from 'react';
import { clamp, lerp, smoothstep } from '../../scene/lib/math';
import type { KnowledgeItem } from './knowledge.data';
import { KNOWLEDGE_CATEGORY_COLOR } from './knowledge.data';
import { PHASE } from './knowledge.constants';

interface KnowledgeBubbleProps {
  item: KnowledgeItem;
  index: number;
  total: number;
  restX: number;
  restY: number;
  knowledgeProgress: number;
  bubbleScale: number;
}

export function KnowledgeBubble({
  item,
  index,
  total,
  restX,
  restY,
  knowledgeProgress,
  bubbleScale,
}: KnowledgeBubbleProps) {
  const tintColor = KNOWLEDGE_CATEGORY_COLOR[item.category];

  const start = lerp(
    PHASE.BUBBLES_START,
    PHASE.BUBBLES_LAST_START,
    total <= 1 ? 0 : index / (total - 1),
  );
  const end = start + PHASE.BUBBLE_TRAVEL;
  const raw = (knowledgeProgress - start) / (end - start);
  const eased = smoothstep(0, 1, clamp(raw, 0, 1));

  const x = restX * eased;
  const y = restY * eased;
  const scale = lerp(0.4, bubbleScale, eased);
  const opacity = eased;

  const style: CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`,
    opacity,
    willChange: 'transform, opacity',
  };

  return <BubbleVisual style={style} label={item.label} tintColor={tintColor} />;
}

function BubbleVisual({
  style,
  label,
  tintColor,
}: {
  style: CSSProperties;
  label: string;
  tintColor: string;
}) {
  return (
    <div
      style={{
        ...style,
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 16,
        boxShadow: `0 4px 30px rgba(0, 0, 0, 0.1), 0 0 18px ${tintColor}33`,
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        padding: '10px 16px',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          fontSize: 12,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: 'var(--color-tertiary)',
          lineHeight: 1.2,
        }}
      >
        {label}
      </span>
    </div>
  );
}
