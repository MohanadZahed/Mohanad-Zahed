import type { CSSProperties } from 'react';
import { Typewriter } from '../../components/Typewriter';

interface FinderBoxProps {
  title?: string;
  lines?: readonly string[];
  start?: boolean;
  width?: number;
  height?: number;
  /**
   * When provided, typing across all lines is driven by scroll (0..1):
   * line `i` sees `clamp01(scrollProgress * lines.length - i)`. Overrides `start`.
   */
  scrollProgress?: number;
  style?: CSSProperties;
}

export function FinderBox({
  title = '',
  lines,
  start = false,
  width = 360,
  height = 260,
  scrollProgress,
  style,
}: FinderBoxProps) {
  const hasLines = lines && lines.length > 0;
  const lineCount = lines?.length ?? 0;
  const compact = width < 280;
  return (
    <div
      aria-hidden={hasLines ? undefined : 'true'}
      style={{
        // Pinned to the fixed terminal font so the finder boxes stay mono
        // regardless of the site-wide font switcher (covers title + lines).
        fontFamily: 'var(--font-terminal)',
        width,
        height,
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
          gap: compact ? 10 : 14,
          padding: compact ? '14px 16px' : '20px 24px',
        }}
      >
        {hasLines &&
          lines!.map((line, i) => {
            const lineScrollProgress =
              scrollProgress === undefined
                ? undefined
                : Math.max(0, Math.min(1, scrollProgress * lineCount - i));
            return (
              <Typewriter
                key={line}
                as='div'
                text={line}
                start={start}
                scrollProgress={lineScrollProgress}
                speed={45}
                cursorMode='blink'
                style={{
                  color: '#e5e5e5',
                  fontSize: compact ? 12 : 16,
                  fontWeight: 500,
                  lineHeight: 1.3,
                  letterSpacing: '-0.01em',
                }}
              />
            );
          })}
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
