import type { CSSProperties } from 'react';
import { clamp, lerp, smoothstep } from '../../scene/lib/math';
import type { KnowledgeItem } from './knowledge.data';
import { KNOWLEDGE_CATEGORY_COLOR } from './knowledge.data';
import { PHASE } from './knowledge.constants';

interface KnowledgeBubbleProps {
  item: KnowledgeItem;
  index: number;
  total: number;
  restAngle: number;
  restRadius: number;
  knowledgeProgress: number;
  layout: 'ring' | 'grid';
}

export function KnowledgeBubble({
  item,
  index,
  total,
  restAngle,
  restRadius,
  knowledgeProgress,
  layout,
}: KnowledgeBubbleProps) {
  const tintColor = KNOWLEDGE_CATEGORY_COLOR[item.category];

  if (layout === 'grid') {
    const gridProgress = clamp((knowledgeProgress - PHASE.BUBBLES_START) / 0.4, 0, 1);
    const style: CSSProperties = {
      opacity: gridProgress,
    };
    return <BubbleVisual style={style} label={item.label} tintColor={tintColor} />;
  }

  const start = lerp(
    PHASE.BUBBLES_START,
    PHASE.BUBBLES_LAST_START,
    total <= 1 ? 0 : index / (total - 1),
  );
  const end = start + PHASE.BUBBLE_TRAVEL;
  const raw = (knowledgeProgress - start) / (end - start);
  const eased = smoothstep(0, 1, clamp(raw, 0, 1));

  const x = Math.cos(restAngle) * restRadius * eased;
  const y = Math.sin(restAngle) * restRadius * eased;
  const scale = lerp(0.4, 1, eased);
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
        borderRadius: 60,
        backdropFilter: 'blur(12px) saturate(150%)',
        WebkitBackdropFilter: 'blur(12px) saturate(150%)',
        background: 'hsla(220, 30%, 95%, 0.10)',
        border: '1px solid hsla(0, 0%, 100%, 0.22)',
        boxShadow: `0 0 24px hsla(0, 0%, 100%, 0.06), inset 0 0 14px hsla(0, 0%, 100%, 0.08), 0 0 18px ${tintColor}33`,
        padding: '10px 16px',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          fontSize: 12,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: 'rgba(244, 244, 245, 0.92)',
          lineHeight: 1.2,
        }}
      >
        {label}
      </span>
    </div>
  );
}
