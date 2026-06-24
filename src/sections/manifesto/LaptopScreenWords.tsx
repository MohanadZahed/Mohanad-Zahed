import type { CSSProperties } from 'react';
import { Typewriter } from '../../components/Typewriter';
import {
  SCREEN_RECT,
  TERMINAL_COMMANDS,
  TERMINAL_PROMPT_PATH,
  TERMINAL_PROMPT_USER,
} from './manifesto.constants';

interface LaptopScreenWordsProps {
  progress: number;
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

const PROMPT_USER_COLOR = '#27c93f';
const PROMPT_PATH_COLOR = '#38bdf8';
const PROMPT_SIGIL_COLOR = 'rgba(255, 255, 255, 0.45)';
const COMMAND_COLOR = '#f5f5f5';

function Prompt() {
  return (
    <span style={{ whiteSpace: 'pre' }}>
      <span style={{ color: PROMPT_USER_COLOR }}>{TERMINAL_PROMPT_USER}</span>{' '}
      <span style={{ color: PROMPT_PATH_COLOR }}>{TERMINAL_PROMPT_PATH}</span>{' '}
      <span style={{ color: PROMPT_SIGIL_COLOR }}>%</span>{' '}
    </span>
  );
}

function BlinkingCursor() {
  return (
    <span
      aria-hidden='true'
      className='cursor-blink'
      style={{ display: 'inline-block', color: COMMAND_COLOR }}
    >
      ▌
    </span>
  );
}

export function LaptopScreenWords({ progress }: LaptopScreenWordsProps) {
  const screenStyle: CSSProperties = {
    position: 'absolute',
    left: `${SCREEN_RECT.leftPct}%`,
    top: `${SCREEN_RECT.topPct}%`,
    width: `${SCREEN_RECT.widthPct}%`,
    height: `${SCREEN_RECT.heightPct}%`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: '0.35em',
    padding: '1.2em',
    fontFamily: 'var(--font-terminal)',
    fontSize: 'clamp(0.78rem, 2vw, 1.7rem)',
    lineHeight: 1.6,
    color: COMMAND_COLOR,
    pointerEvents: 'none',
    overflow: 'hidden',
  };

  // Only revealed commands (prompt shown) render at all. The active line is the
  // last revealed one — it carries the blinking cursor. Once the final command
  // is fully typed, an extra empty prompt rests at the bottom with the cursor.
  const revealedCount = TERMINAL_COMMANDS.filter((c) => progress >= c.typeStart).length;
  const lastDone = progress >= TERMINAL_COMMANDS[TERMINAL_COMMANDS.length - 1].typeEnd;
  const activeIndex = revealedCount - 1;

  return (
    <div id='LaptopScreenWords' style={screenStyle}>
      {TERMINAL_COMMANDS.slice(0, revealedCount).map((c, i) => {
        const typeProgress = clamp01((progress - c.typeStart) / (c.typeEnd - c.typeStart));
        // The cursor sits on the active input line, but once the session has
        // finished it hops to the resting prompt below instead.
        const showCursor = i === activeIndex && !lastDone;

        return (
          <div key={c.command} style={{ whiteSpace: 'pre' }}>
            <Prompt />
            <Typewriter
              text={c.command}
              scrollProgress={typeProgress}
              cursorMode='none'
              style={{ color: COMMAND_COLOR }}
            />
            {showCursor && <BlinkingCursor />}
          </div>
        );
      })}

      {lastDone && (
        <div style={{ whiteSpace: 'pre' }}>
          <Prompt />
          <BlinkingCursor />
        </div>
      )}
    </div>
  );
}
