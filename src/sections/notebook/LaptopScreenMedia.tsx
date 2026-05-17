import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { smoothstep } from '../../scene/lib/math';
import { MEDIA_SCREEN_RECT, PHASE } from './notebook.constants';

interface LaptopScreenMediaProps {
  progress: number;
}

export function LaptopScreenMedia({ progress }: LaptopScreenMediaProps) {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const terminalT = prefersReducedMotion
    ? 1
    : smoothstep(PHASE.TERMINAL_OPEN_START, PHASE.TERMINAL_OPEN_END, progress);
  const videoCovered = terminalT >= 1;

  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (prefersReducedMotion || videoCovered) {
      v.pause();
    } else {
      void v.play().catch(() => {});
    }
  }, [prefersReducedMotion, videoCovered]);

  const screenStyle: CSSProperties = {
    position: 'absolute',
    left: `${MEDIA_SCREEN_RECT.leftPct}%`,
    top: `${MEDIA_SCREEN_RECT.topPct}%`,
    width: `${MEDIA_SCREEN_RECT.widthPct}%`,
    height: `${MEDIA_SCREEN_RECT.heightPct}%`,
    overflow: 'hidden',
    pointerEvents: 'none',
  };

  return (
    <div style={screenStyle} aria-hidden='true'>
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload='auto'
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      >
        <source src='/videos/notebook-video.webm' type='video/webm' />
        <source src='/videos/notebook-video.mp4' type='video/mp4' />
      </video>
      <div
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          background: '#000',
          transformOrigin: 'bottom right',
          transform: `scale(${terminalT})`,
          willChange: 'transform',
        }}
      />
    </div>
  );
}
