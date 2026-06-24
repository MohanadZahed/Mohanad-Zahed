import { forwardRef } from 'react';

const TILE = 160;
export const SPOTLIGHT_RADIUS = 220;

const tracePaths = [
  'M 20 30 H 70 V 80 H 120',
  'M 100 80 V 130',
  'M 30 60 V 110 H 80',
  'M 130 20 V 50 H 150',
  'M 140 100 V 140',
];

const vias: Array<[number, number]> = [
  [20, 30],
  [70, 30],
  [70, 80],
  [100, 80],
  [120, 80],
  [100, 130],
  [30, 60],
  [30, 110],
  [80, 110],
  [130, 20],
  [130, 50],
  [150, 50],
  [140, 100],
  [140, 140],
];

export const CircuitBackground = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div id='CircuitBackground' ref={ref} aria-hidden='true' className='absolute inset-0 overflow-hidden'>
      <svg className='absolute inset-0 h-full w-full' aria-hidden='true'>
        <defs>
          <pattern id='circuit-tile' width={TILE} height={TILE} patternUnits='userSpaceOnUse'>
            <g fill='none' stroke='currentColor' strokeWidth='1.25' strokeLinecap='round'>
              {tracePaths.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
            <g fill='currentColor'>
              {vias.map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r='2.5' />
              ))}
            </g>
          </pattern>
        </defs>

        {/* Layer A — dim base */}
        <rect
          width='100%'
          height='100%'
          fill='url(#circuit-tile)'
          className='text-sky-400'
          style={{ opacity: 0.08 }}
        />

        {/* Layer B — highlight, masked by spotlight (vars come from section root) */}
        <g
          className='circuit-mask'
          style={{ filter: 'drop-shadow(0 0 4px rgb(56 189 248 / 0.7))' }}
        >
          <rect
            width='100%'
            height='100%'
            fill='url(#circuit-tile)'
            className='text-sky-300'
            style={{ opacity: 0.95 }}
          />
        </g>
      </svg>
    </div>
  );
});

CircuitBackground.displayName = 'CircuitBackground';
