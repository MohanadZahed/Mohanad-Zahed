import type { CSSProperties } from 'react';
import { Typewriter } from '../../components/Typewriter';
import { PHASE, SCREEN_RECT } from './notebook.constants';

interface LaptopScreenWordsProps {
  progress: number;
}

interface WordSpec {
  text: string;
  typeStart: number;
  typeEnd: number;
  holdEnd: number;
  fadeEnd: number;
}

const WORDS: WordSpec[] = [
  {
    text: '_plan',
    typeStart: PHASE.PLAN_TYPE_IN[0],
    typeEnd: PHASE.PLAN_TYPE_IN[1],
    holdEnd: PHASE.PLAN_HOLD_END,
    fadeEnd: PHASE.PLAN_FADE_END,
  },
  {
    text: '_build',
    typeStart: PHASE.BUILD_TYPE_IN[0],
    typeEnd: PHASE.BUILD_TYPE_IN[1],
    holdEnd: PHASE.BUILD_HOLD_END,
    fadeEnd: PHASE.BUILD_FADE_END,
  },
  {
    text: '_improve',
    typeStart: PHASE.IMPROVE_TYPE_IN[0],
    typeEnd: PHASE.IMPROVE_TYPE_IN[1],
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
        const opacity =
          progress < w.typeStart || progress >= w.fadeEnd
            ? 0
            : progress < w.holdEnd
              ? 1
              : 1 - (progress - w.holdEnd) / Math.max(0.0001, w.fadeEnd - w.holdEnd);

        const wordScrollProgress = Math.max(
          0,
          Math.min(1, (progress - w.typeStart) / Math.max(0.0001, w.typeEnd - w.typeStart)),
        );

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
            <Typewriter text={w.text} scrollProgress={wordScrollProgress} cursorMode='blink' />
          </div>
        );
      })}
    </div>
  );
}
