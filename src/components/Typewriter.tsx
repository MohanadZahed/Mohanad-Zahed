import {
  createElement,
  useEffect,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';
import { useTypewriter } from '../hooks/useTypewriter';

export type CursorMode = 'blink' | 'hide' | 'beat-then-hide' | 'none';

export interface TypewriterProps {
  text: string;
  start?: boolean;
  /**
   * When provided, typing follows scroll position (0..1) instead of running
   * autonomously. Overrides `start`/`speed`/`startDelay`.
   */
  scrollProgress?: number;
  speed?: number;
  startDelay?: number;
  cursorMode?: CursorMode;
  cursorChar?: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

const BEAT_HOLD_MS = 1500;
const FADE_MS = 200;

function renderAnimatedChars(displayed: string): ReactNode[] {
  const out: ReactNode[] = [];
  let i = 0;
  for (const chunk of displayed.split(/(\s+)/)) {
    if (!chunk) continue;
    if (/^\s+$/.test(chunk)) {
      out.push(chunk);
      i += chunk.length;
      continue;
    }
    for (const ch of chunk) {
      out.push(
        <span key={i} className='char-in'>
          {ch}
        </span>,
      );
      i++;
    }
  }
  return out;
}

export function Typewriter({
  text,
  start = true,
  scrollProgress,
  speed,
  startDelay,
  cursorMode = 'blink',
  cursorChar = '▌',
  as: As = 'span',
  className,
  style,
  id,
}: TypewriterProps) {
  const { displayed, done } = useTypewriter(text, {
    start,
    speed,
    startDelay,
    scrollProgress,
  });
  const [beatHidden, setBeatHidden] = useState(false);
  const [prevStart, setPrevStart] = useState(start);
  const [prevDone, setPrevDone] = useState(done);

  if (start !== prevStart) {
    setPrevStart(start);
    if (!start && beatHidden) setBeatHidden(false);
  }

  if (done !== prevDone) {
    setPrevDone(done);
    if (!done && beatHidden) setBeatHidden(false);
  }

  useEffect(() => {
    if (!done || cursorMode !== 'beat-then-hide') return;
    const t = window.setTimeout(() => setBeatHidden(true), BEAT_HOLD_MS);
    return () => window.clearTimeout(t);
  }, [done, cursorMode]);

  const showCursor =
    cursorMode !== 'none' &&
    (() => {
      if (cursorMode === 'blink') return true;
      if (cursorMode === 'hide') return !done;
      if (cursorMode === 'beat-then-hide') return !beatHidden;
      return false;
    })();

  const cursorStyle: CSSProperties = {
    display: 'inline-block',
    width: '0.6ch',
    /* transform: 'translate(5px, -17px)', */
    transition: `opacity ${FADE_MS}ms linear`,
    opacity: showCursor ? 1 : 0,
  };

  const isScrollMode = scrollProgress !== undefined;

  return createElement(
    As,
    { id, className, style, 'aria-label': text },
    <span aria-hidden='true' style={{ whiteSpace: 'pre-wrap' }}>
      {isScrollMode ? displayed : renderAnimatedChars(displayed)}
    </span>,
    cursorMode !== 'none' && (
      <span
        key='cursor'
        aria-hidden='true'
        className={showCursor ? 'cursor-blink' : undefined}
        style={cursorStyle}
      >
        {cursorChar}
      </span>
    ),
  );
}
