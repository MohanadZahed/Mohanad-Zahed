import { useEffect, useRef } from 'react';
import { useScrollStore } from '../../store/useScrollStore';
import { lerp, smoothstep } from '../../scene/lib/math';
import { KNOWLEDGE_TOP_PROGRESS, PHASE } from './knowledge.constants';

const INK_START = { r: 0, g: 65, b: 109, a: 1 };
const INK_END = { r: 245, g: 241, b: 218, a: 0.95 };

const INK_SHIFT_START = 0.45;
const INK_SHIFT_END = 0.6;
const FADE_IN_END = 0.13;

// Beige wrapper fade-in (global-progress driven, so it only paints once the
// Skills section is on stage — not the entire page from load).
const BEIGE_FADE_IN_START = 0.245;
const BEIGE_FADE_IN_END = KNOWLEDGE_TOP_PROGRESS;

// Initial bright cream "moon" diameter while falling.
const DISC_BOX_PX = 80;
// Final halo diameter relative to viewport's longest side (covers the screen).
const DISC_PEAK_FACTOR = 2.6;
const DISC_FALL_FROM_VH = -120;

export function KnowledgeBackground() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const disc = discRef.current;
    if (!wrapper || !disc) return;

    const root = document.documentElement;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      wrapper.style.backgroundColor = 'transparent';
      disc.style.opacity = '0';
      return;
    }

    const apply = (p: number, gp: number) => {
      const fall = smoothstep(PHASE.AVATAR_SPIN_START, PHASE.AVATAR_SPIN_END, p);
      const expand = smoothstep(PHASE.BUBBLES_START, PHASE.BUBBLES_HOLD, p);
      const fadeIn = smoothstep(PHASE.AVATAR_SPIN_START, FADE_IN_END, p);
      // Beige wrapper bg fades in once Skills is on stage and stays past
      // Knowledge — hidden behind the opaque disc for the rest of the page,
      // and reversible when scrolling back up.
      const beigeAlpha = smoothstep(BEIGE_FADE_IN_START, BEIGE_FADE_IN_END, gp);

      const vh = window.innerHeight;
      const ty = lerp((DISC_FALL_FROM_VH * vh) / 100, 0, fall);

      const vmax = Math.max(window.innerWidth, window.innerHeight);
      const peakPx = vmax * DISC_PEAK_FACTOR;
      const size = lerp(DISC_BOX_PX, peakPx, expand);
      const radiusPct = lerp(50, 0, smoothstep(0.6, 1.0, expand));

      wrapper.style.backgroundColor = `color-mix(in srgb, var(--color-quaternary) ${beigeAlpha * 100}%, transparent)`;
      disc.style.width = `${size}px`;
      disc.style.height = `${size}px`;
      disc.style.transform = `translate3d(0, ${ty}px, 0)`;
      disc.style.borderRadius = `${radiusPct}%`;
      // No exit fade: once expanded, the disc stays opaque so the black
      // backdrop persists into Certificates. Scrolling back up shrinks it
      // out via `fadeIn` and the size lerp naturally.
      disc.style.opacity = String(fadeIn);

      const inkProgress = smoothstep(INK_SHIFT_START, INK_SHIFT_END, p);
      const r = Math.round(lerp(INK_START.r, INK_END.r, inkProgress));
      const g = Math.round(lerp(INK_START.g, INK_END.g, inkProgress));
      const b = Math.round(lerp(INK_START.b, INK_END.b, inkProgress));
      const a = lerp(INK_START.a, INK_END.a, inkProgress);
      root.style.setProperty('--knowledge-ink', `rgba(${r}, ${g}, ${b}, ${a})`);
    };

    const initial = useScrollStore.getState();
    apply(initial.knowledgeProgress, initial.progress);

    const unsubscribe = useScrollStore.subscribe((state, prev) => {
      if (
        state.knowledgeProgress === prev.knowledgeProgress &&
        state.progress === prev.progress
      ) {
        return;
      }
      apply(state.knowledgeProgress, state.progress);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div
      ref={wrapperRef}
      aria-hidden
      className='fixed inset-0 -z-20 pointer-events-none my-circle-mask'
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        willChange: 'background-color',
      }}
    >
      <div
        ref={discRef}
        style={{
          width: DISC_BOX_PX,
          height: DISC_BOX_PX,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 50% 50%, rgb(20, 20, 20) 7%, rgb(0, 0, 0) 22%, rgb(0, 0, 0) 80%, rgb(0, 0, 0) 100%)',
          opacity: 0,
          willChange: 'width, height, transform, opacity',
        }}
      />
    </div>
  );
}
