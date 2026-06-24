import { useState } from 'react';
import { backOut, clamp01 } from '../../scene/lib/math';
import {
  CHECK_SPAN,
  POP_DRAW_SPAN,
  VISION_BUILD_END,
  VISION_BUILD_START,
} from './manifesto.constants';
import type { Side, VisionLayout } from './manifesto.layout';
import { useT } from '../../i18n/useT';

interface ManifestoPipelineProps {
  /** Section-local manifesto progress (0..1). */
  progress: number;
  viewport: { w: number; h: number };
  layout: VisionLayout;
  reduced?: boolean;
}

const CHECK_GREEN = '#22c55e';
const ACCENT = 'var(--color-tertiary)';

export function ManifestoPipeline({
  progress,
  viewport,
  layout,
  reduced = false,
}: ManifestoPipelineProps) {
  const { t } = useT();
  const [fine] = useState(
    () => typeof window === 'undefined' || window.matchMedia('(pointer: fine)').matches,
  );

  const compact = viewport.w < 768;
  const D = compact ? 36 : 52;
  const R = D / 2;

  const drawT = reduced
    ? 1
    : clamp01((progress - VISION_BUILD_START) / (VISION_BUILD_END - VISION_BUILD_START));

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <svg
        width={viewport.w}
        height={viewport.h}
        viewBox={`0 0 ${viewport.w} ${viewport.h}`}
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
        aria-hidden='true'
      >
        <defs>
          {/* A solid stroke that paints on (pathLength reveal) masks the visible
              dashed line, so the dashes appear progressively along the curve. */}
          <mask
            id='manifesto-line-reveal'
            maskUnits='userSpaceOnUse'
            x='0'
            y='0'
            width={viewport.w}
            height={viewport.h}
          >
            <path
              d={layout.pathD}
              fill='none'
              stroke='#fff'
              strokeWidth={(compact ? 2.5 : 3.5) + 6}
              strokeLinecap='round'
              strokeLinejoin='round'
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - drawT}
            />
          </mask>
        </defs>
        <path
          d={layout.pathD}
          fill='none'
          stroke='#ffffff'
          strokeWidth={compact ? 2.5 : 3.5}
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeDasharray={compact ? '7 6' : '9 8'}
          mask='url(#manifesto-line-reveal)'
          style={fine ? { filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.45))' } : undefined}
        />
      </svg>

      {layout.nodes.map((node) => {
        const popT = reduced ? 1 : clamp01((drawT - node.drawU) / POP_DRAW_SPAN);
        const scale = reduced ? 1 : backOut(popT);
        // Cap the check's completion at drawT = 1 so the last node (Deploy,
        // drawU 0.92) finishes stamping exactly as the line reaches the laptop,
        // rather than being left half-drawn when the notebook takeover begins.
        const checkStart = node.drawU + POP_DRAW_SPAN;
        const checkEnd = Math.min(checkStart + CHECK_SPAN, 1);
        const checkT = reduced ? 1 : clamp01((drawT - checkStart) / (checkEnd - checkStart));
        const done = checkT > 0.5;
        const label = t(`manifesto.pipeline.steps.${node.id}`);

        return (
          <div key={node.id}>
            <span
              style={{
                position: 'absolute',
                left: node.x - R,
                top: node.y - R,
                width: D,
                height: D,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(8,12,18,0.85)',
                border: `2px solid ${done ? CHECK_GREEN : ACCENT}`,
                boxShadow:
                  popT > 0.01
                    ? `0 0 16px ${done ? 'rgba(34,197,94,0.4)' : 'rgba(56,189,248,0.4)'}`
                    : 'none',
                transform: `scale(${scale})`,
                opacity: clamp01(popT * 1.4),
                color: ACCENT,
              }}
            >
              <StepIcon icon={node.icon} size={compact ? 17 : 24} />

              <span
                aria-hidden='true'
                style={{
                  position: 'absolute',
                  right: -5,
                  bottom: -5,
                  width: compact ? 17 : 22,
                  height: compact ? 17 : 22,
                  borderRadius: '50%',
                  background: CHECK_GREEN,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${reduced ? 1 : backOut(checkT)})`,
                  opacity: clamp01(checkT * 1.4),
                  boxShadow: '0 2px 6px rgba(0,0,0,0.45)',
                }}
              >
                <CheckMark size={compact ? 11 : 13} progress={checkT} />
              </span>
            </span>

            <Label
              text={label}
              node={node}
              R={R}
              compact={compact}
              opacity={clamp01((popT - 0.2) * 1.6)}
              reduced={reduced}
            />
          </div>
        );
      })}
    </div>
  );
}

function Label({
  text,
  node,
  R,
  compact,
  opacity,
  reduced,
}: {
  text: string;
  node: { x: number; y: number; side: Side };
  R: number;
  compact: boolean;
  opacity: number;
  reduced: boolean;
}) {
  const gap = compact ? 10 : 16;
  const onRight = node.side === 'R';
  return (
    <span
      style={{
        position: 'absolute',
        top: node.y,
        left: onRight ? node.x + R + gap : node.x - R - gap,
        transform: onRight ? 'translateY(-50%)' : 'translate(-100%, -50%)',
        textAlign: onRight ? 'left' : 'right',
        fontFamily: 'var(--font-terminal)',
        fontSize: compact ? 13 : 18,
        fontWeight: 600,
        letterSpacing: '-0.01em',
        lineHeight: 1.1,
        color: 'var(--color-secondary)',
        whiteSpace: 'nowrap',
        opacity: reduced ? 1 : opacity,
        textShadow: '0 1px 6px rgba(0,0,0,0.5)',
      }}
    >
      {text}
    </span>
  );
}

function CheckMark({ size, progress }: { size: number; progress: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' aria-hidden='true'>
      <path
        d='M5 12.5l4.5 4.5L19 7'
        stroke='#fff'
        strokeWidth={3.5}
        strokeLinecap='round'
        strokeLinejoin='round'
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - clamp01(progress)}
      />
    </svg>
  );
}

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function StepIcon({ icon, size }: { icon: string; size: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true as const };
  switch (icon) {
    case 'push':
      return (
        <svg {...common}>
          <path d='M12 19V7' {...STROKE} />
          <path d='M7 12l5-5 5 5' {...STROKE} />
          <path d='M6 4h12' {...STROKE} />
        </svg>
      );
    case 'test':
      return (
        <svg {...common}>
          <path d='M9 2v6l-5 9a2 2 0 0 0 1.8 3h12.4a2 2 0 0 0 1.8-3l-5-9V2' {...STROKE} />
          <path d='M8 2h8' {...STROKE} />
          <path d='M7 16h10' {...STROKE} />
        </svg>
      );
    case 'docker':
      return (
        <svg {...common}>
          <path d='M12 2l9 5v10l-9 5-9-5V7z' {...STROKE} />
          <path d='M12 12l9-5' {...STROKE} />
          <path d='M12 12v10' {...STROKE} />
          <path d='M12 12L3 7' {...STROKE} />
        </svg>
      );
    case 'rocket':
      return (
        <svg {...common}>
          <path d='M5 16c-1.5 1.3-2 5-2 5s3.7-.5 5-2a2.1 2.1 0 0 0-3-3z' {...STROKE} />
          <path
            d='M12 15l-3-3a22 22 0 0 1 2-4A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2z'
            {...STROKE}
          />
          <path d='M9 12H4s.6-3 2-4c1.6-1 5 0 5 0' {...STROKE} />
        </svg>
      );
    default:
      return null;
  }
}
