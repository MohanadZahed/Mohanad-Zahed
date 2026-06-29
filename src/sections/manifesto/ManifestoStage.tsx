import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { clamp01, lerp, smoothstep } from '../../scene/lib/math';
import { rafThrottle } from '../../lib/rafThrottle';
import { Typewriter } from '../../components/Typewriter';
import {
  computeNotebookBoxPx,
  INTRO_SETTLE_END,
  INTRO_ZOOM_IN_END,
  INTRO_ZOOM_PEAK,
  MANIFESTO_WORLD_VH,
  MOBILE_WORLD_TEXTURE_BUDGET_PX,
  NOTEBOOK_ASPECT,
  NOTEBOOK_PARK_CENTER_VH,
  PHASE,
  SMALL_NOTEBOOK_WIDTH_PX,
  START_SCREEN_X,
  TITLE_BOX_W_FRAC,
  TITLE_GAP_PX,
  TITLE_SCREEN_Y,
  TITLE_WORLD_DY_VH,
  VISION_BUILD_END,
  VISION_BUILD_START,
  VISION_EXIT_START,
} from './manifesto.constants';
import { buildArcSamples, computeVisionLayout, pointAtFraction } from './manifesto.layout';
import { LaptopScreenWords } from './LaptopScreenWords';
import { LaptopScreenMedia } from './LaptopScreenMedia';
import { ManifestoVision } from './ManifestoVision';
import { useT } from '../../i18n/useT';
import { useFitText } from '../../hooks/useFitText';

interface ManifestoStageProps {
  progress: number;
}

const NOTEBOOK_SRC = '/textures/notebook.png';

// The title types in over this section-local window, then holds fully typed
// until it begins exiting at PHASE.PIN_START.
const TITLE_TYPE_END = 0.045;

export function ManifestoStage({ progress }: ManifestoStageProps) {
  const { t, locale } = useT();
  const TITLE_TEXT = t('manifesto.title');
  // The heading is the <Typewriter as='h2'> itself; fit it by id against the
  // full title, budgeting the parent's (stable) width so the size stays fixed
  // while it types in (the h2 shrink-wraps to the typed substring).
  useFitText({
    text: TITLE_TEXT,
    elementId: 'manifesto-h2',
    widthFrom: 'parent',
    reserveCh: 0.6,
  });

  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  // Coarse pointer (mobile) → cap the world height so the masked SVG / composited
  // layer fits in one GPU texture (see MOBILE_WORLD_TEXTURE_BUDGET_PX).
  const [isCoarse] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
  );

  // The stage is the `height: 100vh` box. We measure its own clientHeight (the
  // resolved large-viewport height) rather than document.documentElement
  // clientHeight (the small/svh viewport), so the pipeline, sand panel, finder
  // boxes, and laptop spread across the whole viewport — including the strip
  // behind the mobile address bar — and don't reflow when the bar toggles.
  const stageRef = useRef<HTMLDivElement>(null);

  const [viewport, setViewport] = useState(() => ({
    w: typeof window === 'undefined' ? 1920 : document.documentElement.clientWidth,
    h: typeof window === 'undefined' ? 1080 : window.innerHeight,
  }));

  useLayoutEffect(() => {
    const measure = () =>
      setViewport({
        w: document.documentElement.clientWidth,
        h: stageRef.current?.clientHeight ?? window.innerHeight,
      });
    measure();
    const onResize = rafThrottle(measure);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      onResize.cancel();
    };
  }, []);

  // Title types in over [0, TITLE_TYPE_END] (scroll-driven). In motion it then
  // pans off-screen with the camera (no explicit exit); the reduced/static branch
  // still translates it up (titleExit) as before.
  const titleType = clamp01(progress / TITLE_TYPE_END);
  const titleExit = smoothstep(TITLE_TYPE_END, PHASE.PIN_START, progress);
  const titleTranslateY = -titleExit * (viewport.h * 0.6);
  const titleOpacity = 1 - titleExit;

  // The serpentine lives in a tall "world": the path + nodes + finder boxes span
  // MANIFESTO_WORLD_VH viewport-heights and the camera pans down so the drawing
  // tip stays screen-centred (the laptop is off-screen at the very bottom until
  // the tip reaches it). Reduced motion falls back to the single-screen layout
  // (worldH = viewport h) with no camera and the parked → centre notebook drift.
  const dpr = typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio || 1, 3);
  const motionWorldH = MANIFESTO_WORLD_VH * viewport.h;
  const worldH = reduced
    ? viewport.h
    : isCoarse
      ? Math.min(motionWorldH, MOBILE_WORLD_TEXTURE_BUDGET_PX / dpr)
      : motionWorldH;
  const layout = useMemo(
    () => computeVisionLayout(viewport.w, viewport.h, reduced ? undefined : worldH),
    [viewport.w, viewport.h, worldH, reduced],
  );
  const samples = useMemo(() => buildArcSamples(layout), [layout]);

  // Arc-length fraction of the line currently drawn — matches the SVG dash reveal.
  const drawT = reduced
    ? 1
    : clamp01((progress - VISION_BUILD_START) / (VISION_BUILD_END - VISION_BUILD_START));
  const tip = reduced ? layout.notebookEnd : pointAtFraction(samples, drawT);

  // Camera = look-at + zoom (transform-origin 0 0 on the world layers):
  //   worldTransform = translate(cx,cy) · scale(z) · translate(-lookX,-lookY)
  // Intro: the title types at a CONSTANT size near the top (z = 1, look-at on
  // `home`); once typed the camera dollies in toward "system" (z → INTRO_ZOOM_PEAK)
  // while the line drops in from above the top border, then settles to z = 1 and
  // hands the look-at off to the drawing tip. At z=1, lookAt=tip this is exactly
  // the round-1 translate, so the notebook (only shown at z=1) keeps its simple
  // translate form.
  const cx = viewport.w / 2;
  const cy = viewport.h / 2;
  const start = layout.anchors[0] ?? { x: cx, y: 0 };

  // Title sits beside the path's first (vertical) segment; framing places it near
  // the top edge, which pushes the line-start (world y=0) just above the top
  // border so the dashes read as entering from above.
  const titleWorldY = TITLE_WORLD_DY_VH * viewport.h;
  const homeX = start.x - (START_SCREEN_X - 0.5) * viewport.w;
  const homeY = titleWorldY - (TITLE_SCREEN_Y - 0.5) * viewport.h;

  // Push-in that returns: 1 (typing) → PEAK (dolly) → 1 (settle).
  const introZoom = reduced
    ? 1
    : lerp(1, INTRO_ZOOM_PEAK, smoothstep(TITLE_TYPE_END, INTRO_ZOOM_IN_END, progress)) -
      (INTRO_ZOOM_PEAK - 1) * smoothstep(INTRO_ZOOM_IN_END, INTRO_SETTLE_END, progress);
  // Look-at frames `home` through the dolly, then blends to the tip on the settle.
  const lookBlend = reduced ? 1 : smoothstep(INTRO_ZOOM_IN_END, INTRO_SETTLE_END, progress);
  const lookX = lerp(homeX, tip.x, lookBlend);
  const lookY = lerp(homeY, tip.y, lookBlend);

  const worldTransform = reduced
    ? 'none'
    : `translate(${cx}px, ${cy}px) scale(${introZoom}) translate(${-lookX}px, ${-lookY}px)`;
  // Notebook stays on the scale-1 net translate (only visible at z=1).
  const cameraX = reduced ? 0 : cx - lookX;
  const cameraY = reduced ? 0 : cy - lookY;

  // Title box (world px) — right-aligned so "system" ends just left of the
  // line-start; positioned beside the first vertical segment near the top edge.
  const titleBoxW = Math.min(viewport.w * TITLE_BOX_W_FRAC, 900);
  const titleLeft = start.x - TITLE_GAP_PX;
  const titleTop = titleWorldY;

  const titleEl = (
    <Typewriter
      key={locale}
      as='h2'
      id='manifesto-h2'
      text={TITLE_TEXT}
      scrollProgress={titleType}
      cursorMode='hide'
      className='text-secondary font-bold uppercase'
      style={{
        lineHeight: 1.05,
        letterSpacing: '-0.05vw',
        margin: 0,
      }}
    />
  );

  // Once the line reaches it, the notebook grows AND drifts from its parked
  // bottom spot to screen centre in one motion over [VISION_EXIT_START,
  // SCALE_END] — no upward lift/scroll. The terminal phase still starts at
  // SCALE_END (0.47), so downstream is untouched.
  const takeoverT = smoothstep(VISION_EXIT_START, PHASE.SCALE_END, progress);

  const { finalWidth } = computeNotebookBoxPx(viewport.w, viewport.h);

  const smallNotebookWidth = Math.min(SMALL_NOTEBOOK_WIDTH_PX, viewport.w * 0.72);
  const currentWidth = lerp(smallNotebookWidth, finalWidth, takeoverT);
  const currentHeight = currentWidth / NOTEBOOK_ASPECT;

  // Reduced/static: the notebook is parked at the bottom (the serpentine's
  // terminus) and recentres bottom → centre as it grows. Motion: the notebook
  // sits at the world terminus and rides the camera — when the tip arrives the
  // camera has already centred it, so the width grow lands it exactly on
  // computeNotebookBoxPx (no separate drift needed).
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
    paddingTop: 'clamp(4rem, 10vh, 8rem)',
    paddingBottom: 'clamp(4rem, 10vh, 8rem)',
    zIndex: 25,
  };

  const notebookWrapperStyle: CSSProperties = reduced
    ? {
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(-50%, calc(-50% + ${notebookEntryOffsetY}px))`,
        width: currentWidth,
        height: currentHeight,
        willChange: 'width, height, transform',
        zIndex: 40,
      }
    : {
        position: 'absolute',
        left: layout.notebookEnd.x,
        top: layout.notebookEnd.y,
        transform: `translate(${cameraX}px, ${cameraY}px) translate(-50%, -50%)`,
        width: currentWidth,
        height: currentHeight,
        willChange: 'width, height, transform',
        zIndex: 40,
      };

  return (
    <div
      id='ManifestoStage'
      ref={stageRef}
      style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <ManifestoVision
        progress={progress}
        viewport={viewport}
        layout={layout}
        worldTransform={worldTransform}
        reduced={reduced}
      />

      {reduced ? (
        <div style={titleWrapperStyle}>{titleEl}</div>
      ) : (
        // Title world-layer: rides the same camera transform as the pipeline, so
        // it escalates with the intro zoom and pans off-screen on its own as the
        // camera follows the tip down — no explicit exit.
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: worldTransform,
            transformOrigin: '0 0',
            pointerEvents: 'none',
            zIndex: 25,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: titleLeft,
              top: titleTop,
              width: titleBoxW,
              transform: 'translate(-100%, -50%)',
              textAlign: 'right',
            }}
          >
            {titleEl}
          </div>
        </div>
      )}

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
