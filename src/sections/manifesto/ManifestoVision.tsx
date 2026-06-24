import type { CSSProperties } from 'react';
import { backOut, clamp, clamp01, lerp, smoothstep } from '../../scene/lib/math';
import {
  CONTENT_FADE_END,
  FINDER_BOX_WIDTH_PX,
  POP_DRAW_SPAN,
  VISION_BUILD_END,
  VISION_BUILD_START,
  VISION_EXIT_START,
} from './manifesto.constants';
import { computeVisionLayout } from './manifesto.layout';
import { FinderBox } from './FinderBox';
import { ManifestoPipeline } from './ManifestoPipeline';
import { useT } from '../../i18n/useT';

interface ManifestoVisionProps {
  progress: number;
  viewport: { w: number; h: number };
  reduced?: boolean;
}

const MOBILE_BREAKPOINT_PX = 768;
const BOX_TYPE_SPAN = 0.12; // drawT span a box types over, after it pops

// Sand panel — mirrored to fill the LEFT half, angular "circuit-board" seam on
// its right edge. Present from the very start; only fades on exit.
const PANEL_CLIP =
  'polygon(50% 0%, 0 0, 0 100%, 50% 100%, 55% 88%, 55% 75%, 50% 64%, 50% 43%, 57% 30%, 57% 12%)';

export function ManifestoVision({ progress, viewport, reduced = false }: ManifestoVisionProps) {
  const { t, tArray } = useT();
  const isMobile = viewport.w < MOBILE_BREAKPOINT_PX;

  const layout = computeVisionLayout(viewport.w, viewport.h);

  const drawT = reduced
    ? 1
    : clamp01((progress - VISION_BUILD_START) / (VISION_BUILD_END - VISION_BUILD_START));

  // The pipeline + boxes fade out (in place) as the notebook grows to take over;
  // the sand panel stays put (it's simply covered by the full-screen notebook).
  const contentOpacity = 1 - smoothstep(VISION_EXIT_START, CONTENT_FADE_END, progress);

  // Boxes are kept compact so they sit cleanly inside the widened curve bays.
  const boxWidth = isMobile
    ? Math.min(280, viewport.w - 32)
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
    <div style={containerStyle}>
      {/* Sand panel — stays put the whole time (covered by the full notebook). */}
      <div
        id='manifesto-left-panel'
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'var(--color-quaternary)',
          backgroundImage: 'url(/textures/beige-texture.jpg)',
          backgroundBlendMode: 'multiply',
          backgroundRepeat: 'repeat',
          clipPath: PANEL_CLIP,
        }}
      />

      {/* Pipeline fades out in place as the notebook grows to take over. */}
      <div style={{ position: 'absolute', inset: 0, opacity: contentOpacity }}>
        <ManifestoPipeline
          progress={progress}
          viewport={viewport}
          layout={layout}
          reduced={reduced}
        />
      </div>

      {/* Boxes slide off-screen (each its own direction) on the takeover. */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {layout.boxes.map((box) => {
          const popT = reduced ? 1 : clamp01((drawT - box.drawU) / POP_DRAW_SPAN);
          const scale = reduced ? 1 : lerp(0.6, 1, backOut(popT));
          const opacity = reduced ? 1 : clamp01(popT * 1.5);
          const typeScroll = reduced ? 1 : clamp01((drawT - box.drawU) / BOX_TYPE_SPAN);

          const centerX = isMobile
            ? viewport.w / 2
            : clamp(box.x, margin + halfW, viewport.w - margin - halfW);

          // On the laptop takeover each box leaves the screen in its own
          // direction: architecture.md (0) up, delivery.md (1) left,
          // quality.md (2) right. Pure scroll function — scrubs both ways.
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
