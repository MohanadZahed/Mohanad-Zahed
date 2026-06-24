import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { SkillCategory } from './skills.data';

const CATEGORY_COLOR: Record<SkillCategory, string> = {
  frontend: '#38bdf8',
  backend: '#a78bfa',
  ai: '#34d399',
  devops: '#f59e0b',
};

const LABEL: Record<SkillCategory, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  devops: 'DevOps',
  ai: 'AI',
};

const RADIUS = 14;
const GAP_OFFSET_FROM_RIGHT = 96;
const GAP_LEN = 56;
const MIN_WIDTH_FOR_GAP = 240;

interface Props {
  category: SkillCategory;
  children: ReactNode;
}

export function CircuitFrame({ category, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;
  const r = RADIUS;
  const hasSize = w > 0 && h > 0;
  const hasGap = hasSize && w >= MIN_WIDTH_FOR_GAP;

  const gapStart = hasGap ? w - GAP_OFFSET_FROM_RIGHT - GAP_LEN : 0;
  const gapEnd = hasGap ? w - GAP_OFFSET_FROM_RIGHT : 0;

  const traceD = hasSize
    ? hasGap
      ? buildOpenPath(gapEnd, gapStart, w, h, r)
      : buildClosedPath(w, h, r)
    : '';
  const sparkD = hasGap ? `M ${gapStart} 0 H ${gapEnd}` : '';

  return (
    <div
      id={`CircuitFrame-${category}`}
      ref={ref}
      className='circuit-frame'
      style={{ '--cat-color': CATEGORY_COLOR[category] } as CSSProperties}
    >
      {hasSize && (
        <svg
          className='circuit-frame__svg'
          aria-hidden='true'
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
        >
          <path className='circuit-frame__trace' d={traceD} />
          {hasGap && <path className='circuit-frame__spark' d={sparkD} pathLength={1} />}
          <circle className='circuit-frame__via' cx={r} cy={r} r={3} />
          <circle className='circuit-frame__via' cx={w - r} cy={r} r={3} />
          <circle className='circuit-frame__via' cx={w - r} cy={h - r} r={3} />
          <circle className='circuit-frame__via' cx={r} cy={h - r} r={3} />
        </svg>
      )}
      <div className='circuit-frame__body'>
        <div className='circuit-frame__header'>
          <span className='circuit-frame__dot' aria-hidden />
          <span className='circuit-frame__label'>{LABEL[category]}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function buildOpenPath(startX: number, endX: number, w: number, h: number, r: number): string {
  return [
    `M ${startX} 0`,
    `H ${w - r}`,
    `A ${r} ${r} 0 0 1 ${w} ${r}`,
    `V ${h - r}`,
    `A ${r} ${r} 0 0 1 ${w - r} ${h}`,
    `H ${r}`,
    `A ${r} ${r} 0 0 1 0 ${h - r}`,
    `V ${r}`,
    `A ${r} ${r} 0 0 1 ${r} 0`,
    `H ${endX}`,
  ].join(' ');
}

function buildClosedPath(w: number, h: number, r: number): string {
  return [
    `M ${r} 0`,
    `H ${w - r}`,
    `A ${r} ${r} 0 0 1 ${w} ${r}`,
    `V ${h - r}`,
    `A ${r} ${r} 0 0 1 ${w - r} ${h}`,
    `H ${r}`,
    `A ${r} ${r} 0 0 1 0 ${h - r}`,
    `V ${r}`,
    `A ${r} ${r} 0 0 1 ${r} 0`,
    'Z',
  ].join(' ');
}
