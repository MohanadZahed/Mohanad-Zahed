import type { CSSProperties } from 'react';
import { Typewriter } from '../../components/Typewriter';
import { PHASE, SCREEN_RECT } from './notebook.constants';

interface LaptopScreenWordsProps {
  progress: number;
}

interface WordSpec {
  text: string;
  typeStart: number;
  holdEnd: number;
  fadeEnd: number;
}

const WORDS: WordSpec[] = [
  {
    text: 'plan',
    typeStart: PHASE.PLAN_TYPE_IN[0],
    holdEnd: PHASE.PLAN_HOLD_END,
    fadeEnd: PHASE.PLAN_FADE_END,
  },
  {
    text: 'build',
    typeStart: PHASE.BUILD_TYPE_IN[0],
    holdEnd: PHASE.BUILD_HOLD_END,
    fadeEnd: PHASE.BUILD_FADE_END,
  },
  {
    text: 'improve',
    typeStart: PHASE.IMPROVE_TYPE_IN[0],
    holdEnd: PHASE.IMPROVE_HOLD_END,
    fadeEnd: PHASE.IMPROVE_FADE_END,
  },
];

export function LaptopScreenWords({ progress }: LaptopScreenWordsProps) {
  const screenStyle: CSSProperties = {
    position: 'absolute',
    left: `${SCREEN_RECT.leftPct}%`,
    top: `${SCREEN_RECT.topPct}%`,
    width: `${SCREEN_RECT.widthPct}%`,
    height: `${SCREEN_RECT.heightPct}%`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  };

  return (
    <div style={screenStyle}>
      {WORDS.map((w) => {
        const active = progress >= w.typeStart && progress < w.fadeEnd;
        const opacity =
          progress < w.typeStart || progress >= w.fadeEnd
            ? 0
            : progress < w.holdEnd
              ? 1
              : 1 - (progress - w.holdEnd) / Math.max(0.0001, w.fadeEnd - w.holdEnd);

        return (
          <div
            key={w.text}
            style={{
              position: 'absolute',
              opacity,
              transition: 'opacity 120ms linear',
              color: '#ffffff',
              fontSize: 'clamp(2rem, 6vw, 6rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              textTransform: 'lowercase',
            }}
          >
            <Typewriter text={w.text} start={active} cursorMode='hide' speed={70} startDelay={60} />
          </div>
        );
      })}
    </div>
  );
}
