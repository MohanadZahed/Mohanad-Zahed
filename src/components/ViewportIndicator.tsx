import { useEffect, useRef, useState } from 'react';

// Dev-only: hidden in production builds
const ENABLED = import.meta.env.DEV;

type Dims = {
  innerW: number;
  innerH: number;
  visualW: number;
  visualH: number;
};

function readDims(): Dims {
  const vv = window.visualViewport;
  return {
    innerW: window.innerWidth,
    innerH: window.innerHeight,
    visualW: vv?.width ?? window.innerWidth,
    visualH: vv?.height ?? window.innerHeight,
  };
}

export function ViewportIndicator() {
  const [dims, setDims] = useState<Dims>(() => readDims());
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const onResize = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => setDims(readDims()));
    };
    window.addEventListener('resize', onResize);
    const vv = window.visualViewport;
    vv?.addEventListener('resize', onResize);
    vv?.addEventListener('scroll', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      vv?.removeEventListener('resize', onResize);
      vv?.removeEventListener('scroll', onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!ENABLED) return null;

  const visualRoundedW = Math.round(dims.visualW);
  const visualRoundedH = Math.round(dims.visualH);
  const showVisual = visualRoundedW !== dims.innerW || visualRoundedH !== dims.innerH;

  return (
    <div
      style={{
        position: 'fixed',
        top: '0.75rem',
        left: '0.75rem',
        zIndex: 9999,
        fontFamily: 'monospace',
        fontSize: '0.7rem',
        lineHeight: 1.4,
        color: '#f8bd7f',
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(248,189,127,0.25)',
        borderRadius: '4px',
        padding: '3px 7px',
        pointerEvents: 'none',
        userSelect: 'none',
        letterSpacing: '0.03em',
      }}
    >
      <div>inner: {dims.innerW} × {dims.innerH}</div>
      {showVisual && (
        <div>visual: {visualRoundedW} × {visualRoundedH}</div>
      )}
    </div>
  );
}
