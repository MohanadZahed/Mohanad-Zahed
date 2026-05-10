import { useEffect, useRef, useState } from 'react';

export interface UseTypewriterOptions {
  start: boolean;
  speed?: number;
  startDelay?: number;
  scrollProgress?: number;
}

export interface UseTypewriterResult {
  displayed: string;
  done: boolean;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useTypewriter(
  text: string,
  { start, speed = 45, startDelay = 120, scrollProgress }: UseTypewriterOptions,
): UseTypewriterResult {
  const isScrollMode = scrollProgress !== undefined;

  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const [prevText, setPrevText] = useState(text);
  const [prevStart, setPrevStart] = useState(start);

  if (text !== prevText) {
    setPrevText(text);
    setPrevStart(start);
    setDisplayed('');
    setDone(false);
  } else if (start !== prevStart) {
    setPrevStart(start);
    if (start && done) {
      setDisplayed('');
      setDone(false);
    }
  }

  const reduced = prefersReducedMotion();
  if (!isScrollMode && start && reduced && !done) {
    setDisplayed(text);
    setDone(true);
  }

  const rafRef = useRef<number | null>(null);
  const indexRef = useRef(0);
  const lastTickRef = useRef(0);
  const beganRef = useRef(false);

  useEffect(() => {
    if (isScrollMode) return;
    if (!start || reduced || done) return;

    indexRef.current = displayed.length;
    beganRef.current = false;

    const tick = (now: number) => {
      if (!beganRef.current) {
        beganRef.current = true;
        lastTickRef.current = now + startDelay;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (now >= lastTickRef.current) {
        indexRef.current += 1;
        lastTickRef.current = now + speed;
        setDisplayed(text.slice(0, indexRef.current));
        if (indexRef.current >= text.length) {
          setDone(true);
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // displayed is intentionally read once at effect-start to seed indexRef;
    // it must NOT be a dep or every char update would restart the loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScrollMode, start, text, speed, startDelay, reduced, done]);

  if (isScrollMode) {
    const clamped = Math.max(0, Math.min(1, scrollProgress!));
    const count = reduced ? text.length : Math.ceil(clamped * text.length);
    return {
      displayed: text.slice(0, count),
      done: clamped >= 1,
    };
  }

  return { displayed, done };
}
