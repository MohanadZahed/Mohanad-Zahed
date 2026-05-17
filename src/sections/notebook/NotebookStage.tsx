import { useEffect, useState, type CSSProperties } from 'react';
import { lerp, smoothstep } from '../../scene/lib/math';
import { Typewriter } from '../../components/Typewriter';
import { useScrollStore } from '../../store/useScrollStore';
import {
  FINDER_BOX_HEIGHT_PX,
  FINDER_BOX_WIDTH_PX,
  FINDER_TYPING_END,
  FINDER_TYPING_START,
  FULL_NOTEBOOK_MAX_WIDTH_PX,
  PHASE,
  SMALL_NOTEBOOK_WIDTH_PX,
} from './notebook.constants';
import { LaptopScreenWords } from './LaptopScreenWords';
import { LaptopScreenMedia } from './LaptopScreenMedia';
import { FinderBox } from './FinderBox';
import { useT } from '../../i18n/useT';

interface NotebookStageProps {
  progress: number;
}

const NOTEBOOK_SRC = '/textures/notebook.png';
const NOTEBOOK_ASPECT = 16 / 10;

const TITLE_TYPEWRITER_GLOBAL_PROGRESS = 0.054;
const TITLE_BOTTOM_APPROX_PX = 180;
const NOTEBOOK_INITIAL_GAP_PX = 250;

export function NotebookStage({ progress }: NotebookStageProps) {
  const { t, tArray, locale } = useT();
  const LEFT_FINDER_LINES = tArray('notebook.leftFinder.lines');
  const RIGHT_FINDER_LINES = tArray('notebook.rightFinder.lines');
  const LEFT_FINDER_TITLE = t('notebook.leftFinder.fileName');
  const RIGHT_FINDER_TITLE = t('notebook.rightFinder.fileName');
  const TITLE_TEXT = t('notebook.title');
  const globalProgress = useScrollStore((s) => s.progress);
  const titleStarted = globalProgress >= TITLE_TYPEWRITER_GLOBAL_PROGRESS;

  const [viewport, setViewport] = useState(() => ({
    w: typeof window === 'undefined' ? 1920 : window.innerWidth,
    h: typeof window === 'undefined' ? 1080 : window.innerHeight,
  }));

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const titleProgress = smoothstep(0, PHASE.PIN_START, progress);
  const titleTranslateY = -titleProgress * (viewport.h * 0.6);
  const titleOpacity = 1 - titleProgress;

  const notebookEntryT = smoothstep(0, PHASE.PIN_START, progress);

  const fullWidth = Math.min(viewport.w, FULL_NOTEBOOK_MAX_WIDTH_PX);
  const fullHeightForWidth = fullWidth / NOTEBOOK_ASPECT;
  const widthIfHeightCapped = viewport.h * NOTEBOOK_ASPECT;
  const finalWidth =
    fullHeightForWidth > viewport.h ? Math.min(widthIfHeightCapped, fullWidth) : fullWidth;

  // Shrink the "small" notebook on narrow viewports so it doesn't crowd the finder boxes.
  const smallNotebookWidth = Math.min(SMALL_NOTEBOOK_WIDTH_PX, viewport.w * 0.72);
  const scaleT = smoothstep(PHASE.SCALE_START, PHASE.SCALE_END, progress);
  const currentWidth = smallNotebookWidth + (finalWidth - smallNotebookWidth) * scaleT;
  const currentHeight = currentWidth / NOTEBOOK_ASPECT;

  const initialNotebookTopPx = TITLE_BOTTOM_APPROX_PX + NOTEBOOK_INITIAL_GAP_PX;
  const initialOffsetY = initialNotebookTopPx - viewport.h / 2 + currentHeight / 2;
  const notebookEntryOffsetY = (1 - notebookEntryT) * initialOffsetY;

  const handoff = smoothstep(PHASE.HANDOFF_START, PHASE.HANDOFF_END, progress);
  const handoffExitPx = handoff * viewport.h;

  const finderEnterT = smoothstep(PHASE.FINDER_IN_START, PHASE.FINDER_IN_END, progress);
  const finderExitT = smoothstep(PHASE.FINDER_HOLD_END, PHASE.FINDER_OUT_END, progress);

  // Responsive finder box dimensions: shrink below ~900px viewport.
  const finderBoxWidth = Math.min(
    FINDER_BOX_WIDTH_PX,
    Math.max(180, (viewport.w - smallNotebookWidth - 48) / 2),
  );
  const finderBoxHeight =
    finderBoxWidth < FINDER_BOX_WIDTH_PX
      ? FINDER_BOX_HEIGHT_PX * (finderBoxWidth / FINDER_BOX_WIDTH_PX) + 40
      : FINDER_BOX_HEIGHT_PX;

  const finderStartTopPx = viewport.h + 80;
  const finderCentreTopPx = viewport.h / 2 - finderBoxHeight / 2;
  const finderExitTopPx = -finderBoxHeight - 80;

  const finderTopPx = lerp(
    lerp(finderStartTopPx, finderCentreTopPx, finderEnterT),
    finderExitTopPx,
    finderExitT,
  );

  const finderColumnGapPx = Math.max(16, smallNotebookWidth + 24);
  const showFinder = progress >= PHASE.FINDER_IN_START && progress <= PHASE.FINDER_OUT_END + 0.01;

  const finderScrollProgress = Math.max(
    0,
    Math.min(
      1,
      (progress - FINDER_TYPING_START) /
        Math.max(0.0001, FINDER_TYPING_END - FINDER_TYPING_START),
    ),
  );

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
    paddingTop: 'clamp(4rem, 10vh, 8rem)',
    paddingBottom: 'clamp(4rem, 10vh, 8rem)',
  };

  const notebookWrapperStyle: CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: `translate(-50%, calc(-50% + ${notebookEntryOffsetY}px - ${handoffExitPx}px))`,
    width: currentWidth,
    height: currentHeight,
    willChange: 'width, height, transform',
  };

  const finderRowStyle: CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: finderTopPx,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: finderColumnGapPx,
    pointerEvents: 'none',
    visibility: showFinder ? 'visible' : 'hidden',
  };

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <div style={titleWrapperStyle}>
        <Typewriter
          key={locale}
          as='h2'
          id='notebook-h2'
          text={TITLE_TEXT}
          start={titleStarted}
          cursorMode='hide'
          className='text-tertiary font-bold uppercase'
          style={{
            fontSize: 'clamp(1.75rem, 7vw, 4.5rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.05vw',
            margin: 0,
          }}
        />
      </div>

      <div style={finderRowStyle}>
        <FinderBox
          title={LEFT_FINDER_TITLE}
          lines={LEFT_FINDER_LINES}
          width={finderBoxWidth}
          height={finderBoxHeight}
          scrollProgress={finderScrollProgress}
        />
        <FinderBox
          title={RIGHT_FINDER_TITLE}
          lines={RIGHT_FINDER_LINES}
          width={finderBoxWidth}
          height={finderBoxHeight}
          scrollProgress={finderScrollProgress}
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
        {scaleT > 0.6 && <LaptopScreenWords progress={progress} />}
      </div>
    </div>
  );
}
