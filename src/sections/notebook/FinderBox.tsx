import type { CSSProperties } from 'react';
import { FINDER_BOX_HEIGHT_PX, FINDER_BOX_WIDTH_PX } from './notebook.constants';

interface FinderBoxProps {
  title?: string;
  style?: CSSProperties;
}

export function FinderBox({ title = '', style }: FinderBoxProps) {
  return (
    <div
      aria-hidden='true'
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
      <div style={{ flex: 1, background: '#000' }} />
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
