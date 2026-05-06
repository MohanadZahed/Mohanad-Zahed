import type { CSSProperties } from 'react';
import { Typewriter } from '../../components/Typewriter';
import {
  FINDER_BOX_HEIGHT_PX,
  FINDER_BOX_WIDTH_PX,
  FINDER_LINE_BASE_DELAY_MS,
  FINDER_LINE_STAGGER_MS,
} from './notebook.constants';

interface FinderBoxProps {
  title?: string;
  lines?: readonly string[];
  start?: boolean;
  style?: CSSProperties;
}

export function FinderBox({ title = '', lines, start = false, style }: FinderBoxProps) {
  const hasLines = lines && lines.length > 0;
  return (
    <div
      aria-hidden={hasLines ? undefined : 'true'}
      style={{
        width: FINDER_BOX_WIDTH_PX,
        height: FINDER_BOX_HEIGHT_PX,
        background: '#000',
        borderRadius: 10,
        boxShadow: '0 18px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      <div
        style={{
          height: 28,
          background: 'linear-gradient(#2a2a2a, #1a1a1a)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: 8,
          position: 'relative',
        }}
      >
        <span style={dot('#ff5f57')} />
        <span style={dot('#febc2e')} />
        <span style={dot('#28c840')} />
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9a9a9a',
            fontSize: 12,
            pointerEvents: 'none',
          }}
        >
          {title}
        </span>
      </div>
      <div
        style={{
          flex: 1,
          background: '#000',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 14,
          padding: '20px 24px',
        }}
      >
        {hasLines &&
          lines!.map((line, i) => (
            <Typewriter
              key={line}
              as='div'
              text={line}
              start={start}
              speed={45}
              startDelay={FINDER_LINE_BASE_DELAY_MS + i * FINDER_LINE_STAGGER_MS}
              cursorMode='blink'
              style={{
                color: '#e5e5e5',
                fontSize: 16,
                fontWeight: 500,
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
              }}
            />
          ))}
      </div>
    </div>
  );
}

const dot = (color: string): CSSProperties => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  background: color,
  display: 'inline-block',
});
