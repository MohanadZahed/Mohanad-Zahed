import type { CSSProperties } from 'react';
import { backOut, clamp, clamp01, lerp, smoothstep } from '../../scene/lib/math';
import {
  CONTENT_FADE_END,
  FINDER_BOX_WIDTH_PX,
  POP_DRAW_LEAD,
  POP_DRAW_SPAN,
  VISION_EXIT_START,
} from './manifesto.constants';
import type { VisionLayout } from './manifesto.layout';
import { FinderBox } from './FinderBox';
import { ManifestoPipeline } from './ManifestoPipeline';
import { useT } from '../../i18n/useT';

interface ManifestoVisionProps {
  progress: number;
  viewport: { w: number; h: number };
  layout: VisionLayout;
  /** Camera transform (look-at + zoom) applied to the world group, origin 0 0. */
  worldTransform: string;
  /** Arc-length fraction of the line drawn (computed centrally, coarse-aware). */
  drawT: number;
  reduced?: boolean;
}

const MOBILE_BREAKPOINT_PX = 768;
const BOX_TYPE_SPAN = 0.12; // drawT span a box types over, after it pops
// On mobile (camera-follow) the boxes are nudged off the curve toward their own
// bay side by this fraction of the viewport width, so they don't sit on the line.
const MOBILE_BOX_PUSH_FRAC = 0.18;

// Sand panel — mirrored to fill the LEFT half, angular "circuit-board" seam on
// its right edge. Currently disabled (the panel JSX is commented out below);
// re-enable both together to bring it back.
// const PANEL_CLIP =
//   'polygon(50% 0%, 0 0, 0 100%, 50% 100%, 55% 88%, 55% 75%, 50% 64%, 50% 43%, 57% 30%, 57% 12%)';
// On mobile the panel is narrower, so the seam pulls in toward the left edge.
// const PANEL_CLIP_MOBILE =
//   'polygon(40% 0%, 0px 0px, 0px 100%, 40% 100%, 55% 88%, 55% 75%, 40% 63%, 40% 43%, 57% 30%, 57% 12%)';

export function ManifestoVision({
  progress,
  viewport,
  layout,
  worldTransform,
  drawT,
  reduced = false,
}: ManifestoVisionProps) {
  const { t, tArray } = useT();
  const isMobile = viewport.w < MOBILE_BREAKPOINT_PX;

  // The pipeline + boxes fade out (in place) as the notebook grows to take over;
  // the sand panel stays put (it's simply covered by the full-screen notebook).
  const contentOpacity = 1 - smoothstep(VISION_EXIT_START, CONTENT_FADE_END, progress);

  // Boxes are kept compact so they sit cleanly inside the widened curve bays.
  const boxWidth = isMobile
    ? Math.min(220, viewport.w - 32)
    : Math.min(FINDER_BOX_WIDTH_PX, Math.max(220, viewport.w * 0.21));
  const boxHeight = isMobile ? 116 : 150;
  const halfW = boxWidth / 2;
  const margin = isMobile ? 12 : 24;

  const containerStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 20,
  };

  const boxStyle: CSSProperties = {
    border: '1px solid rgba(56,189,248,0.7)',
    boxShadow: '0 0 0 1px rgba(56,189,248,0.25), 0 18px 50px rgba(0,0,0,0.55)',
  };

  return (
    <div id='ManifestoVision' style={containerStyle}>
      {/* Sand panel — stays put the whole time (covered by the full notebook). */}
      {/* <div
        id='manifesto-left-panel'
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'var(--color-quaternary)',
          backgroundImage: 'url(/textures/texture2.png)',
          backgroundBlendMode: 'difference',
          backgroundRepeat: 'repeat',
          clipPath: isMobile ? PANEL_CLIP_MOBILE : PANEL_CLIP,
        }}
      /> */}

      {/* Camera "world": the pipeline + finder boxes live in (possibly taller-
          than-viewport) world space and are translated so the drawing tip stays
          screen-centred. The whole group fades out as the notebook takes over. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: worldTransform,
          transformOrigin: '0 0',
          opacity: contentOpacity,
          willChange: 'transform, opacity',
        }}
      >
        <ManifestoPipeline
          drawT={drawT}
          viewport={viewport}
          layout={layout}
          reduced={reduced}
        />

        {/* Boxes pop into the curve bays; on the takeover they slide off-screen. */}
        {layout.boxes.map((box) => {
          const boxDrawU = box.drawU - POP_DRAW_LEAD;
          const popT = reduced ? 1 : clamp01((drawT - boxDrawU) / POP_DRAW_SPAN);
          const scale = reduced ? 1 : lerp(0.6, 1, backOut(popT));
          const opacity = reduced ? 1 : clamp01(popT * 1.5);
          const typeScroll = reduced ? 1 : clamp01((drawT - boxDrawU) / BOX_TYPE_SPAN);

          // Static/reduced layout clamps boxes inside the single viewport; the
          // camera-follow layout places them at their world anchor. On mobile the
          // box is nudged off the curve toward its own bay side (away from the line
          // at that y, which is on the opposite/bend side), since the camera — not
          // the clamp — frames them.
          const centerX = reduced
            ? isMobile
              ? clamp([310, 115, 310][box.index], margin + halfW, viewport.w - margin - halfW)
              : clamp(box.x, margin + halfW, viewport.w - margin - halfW)
            : isMobile
              ? viewport.w / 2 + (box.side === 'R' ? 1 : -1) * viewport.w * MOBILE_BOX_PUSH_FRAC
              : box.x;

          // On the laptop takeover each box leaves in its own direction:
          // architecture.md (0) up, delivery.md (1) left, quality.md (2) right.
          // Pure scroll function — scrubs both ways.
          const exitT = smoothstep(VISION_EXIT_START, CONTENT_FADE_END, progress);
          let exitX = 0;
          let exitY = 0;
          if (box.index === 0) exitY = -(box.y + boxHeight);
          else if (box.index === 1) exitX = -(centerX + halfW);
          else exitX = viewport.w - centerX + halfW;
          const tx = exitX * exitT;
          const ty = exitY * exitT;

          return (
            <div
              key={box.index}
              style={{
                position: 'absolute',
                left: centerX,
                top: box.y,
                transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${scale})`,
                transformOrigin: 'center',
                opacity,
                willChange: 'transform, opacity',
              }}
            >
              <FinderBox
                id={`FinderBox-${box.index}`}
                title={t(`manifesto.finderBoxes.${box.index}.fileName`)}
                lines={tArray(`manifesto.finderBoxes.${box.index}.lines`)}
                width={boxWidth}
                height={boxHeight}
                scrollProgress={typeScroll}
                style={boxStyle}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
