import { useEffect, useRef } from 'react';
import { useScrollStore } from '../../store/useScrollStore';
import { lerp, smoothstep } from '../../scene/lib/math';
import { PHASE } from './knowledge.constants';

const INK_LIGHT = { r: 244, g: 244, b: 245, a: 0.92 };
const INK_DARK = { r: 0, g: 65, b: 109, a: 1 };

const INK_SHIFT_START = 0.45;
const INK_SHIFT_END = 0.6;
const FADE_IN_END = 0.13;

// Initial bright cream "moon" diameter while falling.
const DISC_BOX_PX = 80;
// Final halo diameter relative to viewport's longest side (covers the screen).
const DISC_PEAK_FACTOR = 2.6;
const DISC_FALL_FROM_VH = -120;

export function KnowledgeBackground() {
  const discRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const disc = discRef.current;
    if (!disc) return;

    const root = document.documentElement;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      disc.style.opacity = '0';
      return;
    }

    const apply = (p: number) => {
      const fall = smoothstep(PHASE.AVATAR_SPIN_START, PHASE.AVATAR_SPIN_END, p);
      const expand = smoothstep(PHASE.BUBBLES_START, PHASE.BUBBLES_HOLD, p);
      const fadeIn = smoothstep(PHASE.AVATAR_SPIN_START, FADE_IN_END, p);

      const vh = window.innerHeight;
      const ty = lerp((DISC_FALL_FROM_VH * vh) / 100, 0, fall);

      const vmax = Math.max(window.innerWidth, window.innerHeight);
      const peakPx = vmax * DISC_PEAK_FACTOR;
      const size = lerp(DISC_BOX_PX, peakPx, expand);

      disc.style.width = `${size}px`;
      disc.style.height = `${size}px`;
      disc.style.transform = `translate3d(0, ${ty}px, 0)`;
      disc.style.opacity = String(fadeIn);

      const inkProgress = smoothstep(INK_SHIFT_START, INK_SHIFT_END, p);
      const r = Math.round(lerp(INK_LIGHT.r, INK_DARK.r, inkProgress));
      const g = Math.round(lerp(INK_LIGHT.g, INK_DARK.g, inkProgress));
      const b = Math.round(lerp(INK_LIGHT.b, INK_DARK.b, inkProgress));
      const a = lerp(INK_LIGHT.a, INK_DARK.a, inkProgress);
      root.style.setProperty('--knowledge-ink', `rgba(${r}, ${g}, ${b}, ${a})`);
    };

    apply(useScrollStore.getState().knowledgeProgress);

    const unsubscribe = useScrollStore.subscribe((state, prev) => {
      if (state.knowledgeProgress === prev.knowledgeProgress) return;
      apply(state.knowledgeProgress);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div
      aria-hidden
      className='fixed inset-0 -z-20 pointer-events-none my-circle-mask'
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        ref={discRef}
        style={{
          width: DISC_BOX_PX,
          height: DISC_BOX_PX,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 50% 50%, rgb(245, 241, 218) 7%, rgb(245 241 218 / 43%) 22%, rgb(19 15 33 / 93%) 80%, rgb(19 15 33 / 80%) 100%)',
          opacity: 0,
          willChange: 'width, height, transform, opacity',
        }}
      />
    </div>
  );
}
