import { useEffect, useState, type CSSProperties } from 'react';
import { lerp, smoothstep } from '../../scene/lib/math';
import { rafThrottle } from '../../lib/rafThrottle';
import { Typewriter } from '../../components/Typewriter';
import {
  computeNotebookBoxPx,
  NOTEBOOK_ASPECT,
  NOTEBOOK_PARK_CENTER_VH,
  PHASE,
  SMALL_NOTEBOOK_WIDTH_PX,
  VISION_EXIT_START,
} from './manifesto.constants';
import { LaptopScreenWords } from './LaptopScreenWords';
import { LaptopScreenMedia } from './LaptopScreenMedia';
import { ManifestoVision } from './ManifestoVision';
import { useT } from '../../i18n/useT';

interface ManifestoStageProps {
  progress: number;
}

const NOTEBOOK_SRC = '/textures/notebook.png';

// The title types in over this section-local window, then holds fully typed
// until it begins exiting at PHASE.PIN_START.
const TITLE_TYPE_END = 0.045;

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function ManifestoStage({ progress }: ManifestoStageProps) {
  const { t, locale } = useT();
  const TITLE_TEXT = t('manifesto.title');

  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  const [viewport, setViewport] = useState(() => ({
    w: typeof window === 'undefined' ? 1920 : document.documentElement.clientWidth,
    h: typeof window === 'undefined' ? 1080 : document.documentElement.clientHeight,
  }));

  useEffect(() => {
    const onResize = rafThrottle(() =>
      setViewport({
        w: document.documentElement.clientWidth,
        h: document.documentElement.clientHeight,
      }),
    );
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      onResize.cancel();
    };
  }, []);

  // Title types in over [0, TITLE_TYPE_END] (scroll-driven), holds, then exits.
  const titleType = clamp01(progress / TITLE_TYPE_END);
  const titleExit = smoothstep(TITLE_TYPE_END, PHASE.PIN_START, progress);
  const titleTranslateY = -titleExit * (viewport.h * 0.6);
  const titleOpacity = 1 - titleExit;

  // Once the line reaches it, the notebook grows AND drifts from its parked
  // bottom spot to screen centre in one motion over [VISION_EXIT_START,
  // SCALE_END] — no upward lift/scroll. The terminal phase still starts at
  // SCALE_END (0.47), so downstream is untouched.
  const takeoverT = smoothstep(VISION_EXIT_START, PHASE.SCALE_END, progress);

  const { finalWidth } = computeNotebookBoxPx(viewport.w, viewport.h);

  const smallNotebookWidth = Math.min(SMALL_NOTEBOOK_WIDTH_PX, viewport.w * 0.72);
  const currentWidth = lerp(smallNotebookWidth, finalWidth, takeoverT);
  const currentHeight = currentWidth / NOTEBOOK_ASPECT;

  // Parked at the bottom (the serpentine's terminus) and visible the whole time;
  // recenters bottom → centre as it grows.
  const parkedOffsetY = NOTEBOOK_PARK_CENTER_VH * viewport.h - viewport.h / 2;
  const notebookEntryOffsetY = (1 - takeoverT) * parkedOffsetY;

  const titleWrapperStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    transform: `translateY(${titleTranslateY}px)`,
    opacity: titleOpacity,
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 'clamp(1.5rem, 6vw, 6rem)',
    paddingRight: 'clamp(1.5rem, 6vw, 6rem)',
    paddingTop: 'clamp(4rem, 10svh, 8rem)',
    paddingBottom: 'clamp(4rem, 10svh, 8rem)',
    zIndex: 25,
  };

  const notebookWrapperStyle: CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: `translate(-50%, calc(-50% + ${notebookEntryOffsetY}px))`,
    width: currentWidth,
    height: currentHeight,
    willChange: 'width, height, transform',
    zIndex: 40,
  };

  return (
    <div
      id='ManifestoStage'
      style={{
        position: 'sticky',
        top: 0,
        height: '100svh',
        width: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <ManifestoVision progress={progress} viewport={viewport} reduced={reduced} />

      <div style={titleWrapperStyle}>
        <Typewriter
          key={locale}
          as='h2'
          id='manifesto-h2'
          text={TITLE_TEXT}
          scrollProgress={titleType}
          cursorMode='hide'
          className='text-secondary font-bold uppercase'
          style={{
            fontSize: 'clamp(2.75rem, 7vw, 5.5rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.05vw',
            margin: 0,
          }}
        />
      </div>

      <div style={notebookWrapperStyle}>
        <LaptopScreenMedia progress={progress} />
        <img
          src={NOTEBOOK_SRC}
          alt=''
          aria-hidden='true'
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            userSelect: 'none',
            position: 'relative',
          }}
        />
        {takeoverT > 0.6 && <LaptopScreenWords progress={progress} />}
      </div>
    </div>
  );
}
