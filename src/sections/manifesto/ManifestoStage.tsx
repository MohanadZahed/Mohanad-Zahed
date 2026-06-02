import { useEffect, useState, type CSSProperties } from 'react';
import { lerp, smoothstep } from '../../scene/lib/math';
import { Typewriter } from '../../components/Typewriter';
import {
  computeNotebookBoxPx,
  FINDER_BOX_HEIGHT_PX,
  FINDER_BOX_RANGES,
  FINDER_BOX_WIDTH_PX,
  NOTEBOOK_ASPECT,
  PHASE,
  SMALL_NOTEBOOK_WIDTH_PX,
} from './manifesto.constants';
import { LaptopScreenWords } from './LaptopScreenWords';
import { LaptopScreenMedia } from './LaptopScreenMedia';
import { FinderBox } from './FinderBox';
import { ManifestoCircuit } from './ManifestoCircuit';
import { useT } from '../../i18n/useT';

interface ManifestoStageProps {
  progress: number;
}

const NOTEBOOK_SRC = '/textures/notebook.png';

// The title types in over this section-local window, then holds fully typed
// until it begins exiting at PHASE.PIN_START.
const TITLE_TYPE_END = 0.045;
const TITLE_BOTTOM_APPROX_PX = 180;
const NOTEBOOK_INITIAL_GAP_PX = 250;

const MOBILE_BREAKPOINT_PX = 768;
const EDGE_MARGIN_PX = 12;
const DESKTOP_EDGE_MARGIN_PX = 24;

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function ManifestoStage({ progress }: ManifestoStageProps) {
  const { t, tArray, locale } = useT();
  const TITLE_TEXT = t('manifesto.title');

  const [viewport, setViewport] = useState(() => ({
    w: typeof window === 'undefined' ? 1920 : document.documentElement.clientWidth,
    h: typeof window === 'undefined' ? 1080 : document.documentElement.clientHeight,
  }));

  useEffect(() => {
    const onResize = () =>
      setViewport({
        w: document.documentElement.clientWidth,
        h: document.documentElement.clientHeight,
      });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Title types in over [0, TITLE_TYPE_END] (scroll-driven), holds, then exits.
  const titleType = clamp01(progress / TITLE_TYPE_END);
  const titleExit = smoothstep(TITLE_TYPE_END, PHASE.PIN_START, progress);
  const titleTranslateY = -titleExit * (viewport.h * 0.6);
  const titleOpacity = 1 - titleExit;

  const notebookEntryT = smoothstep(0, PHASE.PIN_START, progress);

  const { finalWidth } = computeNotebookBoxPx(viewport.w, viewport.h);

  const smallNotebookWidth = Math.min(SMALL_NOTEBOOK_WIDTH_PX, viewport.w * 0.72);
  const scaleT = smoothstep(PHASE.SCALE_START, PHASE.SCALE_END, progress);
  const currentWidth = smallNotebookWidth + (finalWidth - smallNotebookWidth) * scaleT;
  const currentHeight = currentWidth / NOTEBOOK_ASPECT;

  const initialNotebookTopPx = TITLE_BOTTOM_APPROX_PX + NOTEBOOK_INITIAL_GAP_PX;
  const initialOffsetY = initialNotebookTopPx - viewport.h / 2 + currentHeight / 2;
  const notebookEntryOffsetY = (1 - notebookEntryT) * initialOffsetY;

  const isMobile = viewport.w < MOBILE_BREAKPOINT_PX;
  const finderBoxWidth = isMobile
    ? Math.min(268, viewport.w - 32)
    : Math.min(FINDER_BOX_WIDTH_PX, Math.max(220, (viewport.w - smallNotebookWidth - 48) / 2));
  const finderBoxHeight = isMobile
    ? finderBoxWidth * 0.55
    : finderBoxWidth < FINDER_BOX_WIDTH_PX
      ? FINDER_BOX_HEIGHT_PX * (finderBoxWidth / FINDER_BOX_WIDTH_PX) + 40
      : FINDER_BOX_HEIGHT_PX;

  const finderStartTopPx = viewport.h + finderBoxHeight / 2 + 40;
  const finderExitTopPx = -finderBoxHeight - 40;

  const desktopSideOffsetPx = Math.max(
    DESKTOP_EDGE_MARGIN_PX,
    viewport.w / 2 - smallNotebookWidth / 2 - finderBoxWidth - DESKTOP_EDGE_MARGIN_PX,
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
    paddingTop: 'clamp(4rem, 10svh, 8rem)',
    paddingBottom: 'clamp(4rem, 10svh, 8rem)',
  };

  const notebookWrapperStyle: CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: `translate(-50%, calc(-50% + ${notebookEntryOffsetY}px))`,
    width: currentWidth,
    height: currentHeight,
    willChange: 'width, height, transform',
  };

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        height: '100svh',
        width: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <ManifestoCircuit progress={progress} color='var(--color-secondary)' />

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

      {FINDER_BOX_RANGES.map(([rangeStart, rangeEnd], i) => {
        const span = Math.max(0.0001, rangeEnd - rangeStart);
        const travelT = clamp01((progress - rangeStart) / span);
        const topPx = lerp(finderStartTopPx, finderExitTopPx, travelT);
        // Typing completes at the window midpoint (vertical centre of viewport).
        const typingScrollProgress = clamp01((progress - rangeStart) / (span * 0.5));
        const visible = progress >= rangeStart - 0.01 && progress <= rangeEnd + 0.01;
        const sideIsLeft = i % 2 === 0;

        const wrapperStyle: CSSProperties = {
          position: 'absolute',
          top: topPx - finderBoxHeight / 2,
          width: finderBoxWidth,
          height: finderBoxHeight,
          pointerEvents: 'none',
          visibility: visible ? 'visible' : 'hidden',
          zIndex: 30,
          ...(sideIsLeft
            ? { left: isMobile ? EDGE_MARGIN_PX : desktopSideOffsetPx }
            : { right: isMobile ? EDGE_MARGIN_PX : desktopSideOffsetPx }),
        };

        const fileName = t(`manifesto.finderBoxes.${i}.fileName`);
        const lines = tArray(`manifesto.finderBoxes.${i}.lines`);

        return (
          <div key={i} style={wrapperStyle}>
            <FinderBox
              title={fileName}
              lines={lines}
              width={finderBoxWidth}
              height={finderBoxHeight}
              scrollProgress={typingScrollProgress}
            />
          </div>
        );
      })}

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
