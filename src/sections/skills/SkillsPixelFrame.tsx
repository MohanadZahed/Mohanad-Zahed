import { useEffect, useRef } from 'react';
import { useScrollStore } from '../../store/useScrollStore';
import { clamp, lerp, smoothstep } from '../../scene/lib/math';
import { computeScreenRectPx } from '../manifesto/manifesto.constants';
import {
  PIXEL_CELL_MAX_PX,
  PIXEL_CELL_MIN_PX,
  PIXEL_DONE_Z,
  PIXEL_EDGE_OVERLAP_PX,
  PIXEL_FADE_CURVE,
  PIXEL_FADE_IN_Z,
  PIXEL_FLUCTUATE_DEPTH,
  PIXEL_FLUCTUATE_INNER,
  PIXEL_FLUCTUATE_OUTER,
  PIXEL_GAP_PX,
  PIXEL_INNER_OPACITY,
  PIXEL_INNER_PRESENCE,
  PIXEL_LAYERS,
  PIXEL_MAX_ALPHA,
  PIXEL_OSC_CYCLES,
  PIXEL_OUTER_OPACITY,
  PIXEL_OUTER_PRESENCE,
  ZOOM_END,
  ZOOM_START,
} from './skills.constants';

const TWO_PI = Math.PI * 2;

// Cheap deterministic integer hash → [0, 1). `seed` lets one (c, r) cell pull
// several uncorrelated values (presence / static opacity / fluctuate / phase).
const hash = (c: number, r: number, seed: number): number => {
  let h = (c * 374761393 + r * 668265263 + seed * 1442695041) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/**
 * Pixel frame drawn around the Skills section during its zoom.
 *
 * During `[ZOOM_START, ZOOM_END]` the section scales from the laptop screen-rect
 * out to the full viewport (see Skills.tsx `apply()`). This component paints the
 * region *outside* that growing reveal window with a 4-ring band of black squares
 * that reads like an edge dissolving into pixels: the inner ring is dense/solid,
 * the outer rings dissolve into scattered squares, every pixel has its own opacity
 * (dither texture), and a scattered subset per ring (15/30/45/60% inner→outer)
 * shimmers.
 *
 * Opacity is a *pure function of scroll position* — there is no time-based clock,
 * so the pixels only move while the user is actively scrolling and freeze when
 * they stop. We redraw inside the store subscriber (ScrollTrigger's onUpdate is
 * already rAF-synced). The draw is skipped entirely outside the on-screen zoom
 * window, and the canvas is cleared once on the active→inactive transition.
 * Mounted only in the motion-enabled branch of Skills.tsx.
 */
export function SkillsPixelFrame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const wasActiveRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Resizing the backing store resets the transform + fillStyle — re-apply
        // so we can draw in CSS pixels with a black fill.
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = '#000';
        ctxRef.current = ctx;
      }
    };
    sizeCanvas();

    const draw = () => {
      const ctx = ctxRef.current;
      if (!ctx) return;

      const sp = useScrollStore.getState().skillsIntro;
      const z = smoothstep(ZOOM_START, ZOOM_END, sp);
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;

      // Off-screen / pre-zoom → clear once on the active→inactive transition.
      if (z <= 0 || z >= PIXEL_DONE_Z) {
        if (wasActiveRef.current) {
          ctx.clearRect(0, 0, vw, vh);
          wasActiveRef.current = false;
        }
        return;
      }
      wasActiveRef.current = true;

      const { rectX, rectY, rectW, rectH } = computeScreenRectPx(vw, vh);
      // Same reveal window as Skills.tsx `apply()`: screen-rect → full viewport.
      const winX = lerp(rectX, 0, z);
      const winY = lerp(rectY, 0, z);
      const winW = lerp(rectW, vw, z);
      const winH = lerp(rectH, vh, z);
      const winR = winX + winW;
      const winB = winY + winH;

      const cell = lerp(PIXEL_CELL_MIN_PX, PIXEL_CELL_MAX_PX, z);
      const band = PIXEL_LAYERS * cell;
      const appear = smoothstep(0, PIXEL_FADE_IN_Z, z) * PIXEL_MAX_ALPHA;
      // Scroll position drives the shimmer phase (no time term → freezes on stop).
      const scrollPhase = z * PIXEL_OSC_CYCLES * TWO_PI;

      ctx.clearRect(0, 0, vw, vh);

      // Clip every fill to the region OUTSIDE the reveal window, but inset the
      // window "hole" by PIXEL_EDGE_OVERLAP_PX so the frame paints a few px INTO
      // the section edge. The content (on top) masks that overlap where it paints;
      // at the fractional window edge it fills the hairline seam between the
      // CSS-clipped section and the canvas frame — no gap on any side.
      const ov = PIXEL_EDGE_OVERLAP_PX;
      const holeX = winX + ov;
      const holeY = winY + ov;
      const holeR = winR - ov;
      const holeB = winB - ov;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, vw, vh);
      ctx.rect(holeX, holeY, Math.max(0, holeR - holeX), Math.max(0, holeB - holeY));
      ctx.clip('evenodd');

      // Grid anchored to the FIXED viewport origin (0,0), not the moving window
      // edge — so each cell holds its screen position (x = c·cell) as the section
      // grows and the field doesn't crawl. (c, r) are global integer indices, so
      // every per-pixel hash is stable per screen location. We iterate only the
      // index range that covers the band region around the current window.
      const cStart = Math.floor((winX - band) / cell);
      const cEnd = Math.ceil((winR + band) / cell);
      const rStart = Math.floor((winY - band) / cell);
      const rEnd = Math.ceil((winB + band) / cell);

      for (let r = rStart; r <= rEnd; r++) {
        const y = r * cell;
        if (y > vh || y + cell < 0) continue; // off-screen row
        const cy = y + cell / 2;
        const distOutY = Math.max(0, winY - cy, cy - winB);
        for (let c = cStart; c <= cEnd; c++) {
          const x = c * cell;
          if (x > vw || x + cell < 0) continue; // off-screen column
          const cx = x + cell / 2;
          const distOutX = Math.max(0, winX - cx, cx - winR);
          // Skip only cells lying ENTIRELY inside the (inset) window hole. Cells
          // that poke into the overlap band or outside are kept and clipped flush,
          // so the first ring always hugs — and slightly overlaps — the section.
          if (x >= holeX && y >= holeY && x + cell <= holeR && y + cell <= holeB) continue;

          // Continuous normalised distance from the section edge across the band
          // (0 = hugging the section, 1 = outer edge) → a smooth gradient, not
          // stepped per ring.
          const d = clamp(Math.max(distOutX, distOutY) / band, 0, 1);
          const fade = Math.pow(d, PIXEL_FADE_CURVE);

          // Presence (density) follows the same curve as opacity, so the inner
          // band stays dense/dark longer before dissolving toward the outside.
          if (hash(c, r, 1) >= lerp(PIXEL_INNER_PRESENCE, PIXEL_OUTER_PRESENCE, fade)) continue;

          // Opacity drives the dark (inner) → faded (outer) gradient.
          const baseOpacity = lerp(PIXEL_INNER_OPACITY, PIXEL_OUTER_OPACITY, fade);
          const flucFrac = lerp(PIXEL_FLUCTUATE_INNER, PIXEL_FLUCTUATE_OUTER, d);
          let opacity: number;
          if (hash(c, r, 3) < flucFrac) {
            // Scroll-driven shimmer, desynced per pixel — but kept within the
            // local brightness so it can't break the gradient.
            const phase = hash(c, r, 4) * TWO_PI;
            const osc = 0.5 + 0.5 * Math.sin(scrollPhase + phase); // 0..1
            opacity = baseOpacity * (1 - PIXEL_FLUCTUATE_DEPTH * osc);
          } else {
            opacity = baseOpacity;
          }

          const alpha = opacity * appear;
          if (alpha <= 0.01) continue;
          // Integer-snap to shared cell edges so neighbours abut exactly — kills
          // the sub-pixel seams that flicker between cells while scrolling.
          const xi = Math.round(x);
          const yi = Math.round(y);
          const wi = Math.round(x + cell) - xi - PIXEL_GAP_PX;
          const hi = Math.round(y + cell) - yi - PIXEL_GAP_PX;
          ctx.globalAlpha = alpha;
          ctx.fillRect(xi, yi, wi, hi);
        }
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    };

    const onResize = () => {
      sizeCanvas();
      draw();
    };

    // Redraw on any store change (scroll). Opacity is a pure function of scroll
    // position, so no rAF loop is needed — the frame freezes when scrolling stops.
    const unsub = useScrollStore.subscribe(draw);
    window.addEventListener('resize', onResize, { passive: true });
    draw();

    return () => {
      unsub();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className='pointer-events-none fixed inset-0' />;
}
